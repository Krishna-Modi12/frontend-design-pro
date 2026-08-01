#!/usr/bin/env node
/**
 * Parser-based semantic constraints (F-08).
 * Parses a .tsx file into a TypeScript AST and verifies MEANING, not strings:
 * comments and string literals cannot masquerade as compliance.
 *
 * Usage: node scripts/parser_constraints.js <file.tsx>
 * Output: JSON { file, checks: {ID: bool}, errors: [{check, line, message}] }
 * Requires: npm install typescript (resolved from any ancestor node_modules).
 */
"use strict";
const fs = require("fs");
const path = require("path");
const ts = require("typescript");

const file = process.argv[2];
if (!file) { console.error("usage: parser_constraints.js <file.tsx>"); process.exit(2); }
const sourceText = fs.readFileSync(file, "utf8");
const sf = ts.createSourceFile(path.basename(file), sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

const errors = [];
const checks = {};
const line = (node) => sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;
const fail = (check, node, message) => errors.push({ check, line: node ? line(node) : 0, message });

// ── generic walkers ─────────────────────────────────────────────────────────
function walk(node, fn) { fn(node); ts.forEachChild(node, (c) => walk(c, fn)); }
function ancestors(node) { const out = []; let p = node.parent; while (p) { out.push(p); p = p.parent; } return out; }

const INTERACTIVE = new Set(["button", "a", "input", "textarea", "select", "summary", "details", "label", "option"]);
const isIntrinsic = (tagName) => ts.isIdentifier(tagName) && /^[a-z]/.test(tagName.text);
function tagOf(el) { // JsxOpeningElement | JsxSelfClosingElement -> string | null (null = custom component)
  const t = el.tagName;
  return ts.isIdentifier(t) && /^[a-z]/.test(t.text) ? t.text : null;
}
function attrsOf(el) {
  const out = {};
  for (const a of el.attributes.properties) {
    if (ts.isJsxAttribute(a) && a.name && ts.isIdentifier(a.name)) out[a.name.text] = a;
  }
  return out;
}
function attrStringValue(attr) {
  if (!attr || !attr.initializer) return null;
  if (ts.isStringLiteral(attr.initializer)) return attr.initializer.text;
  if (ts.isJsxExpression(attr.initializer) && attr.initializer.expression) {
    const e = attr.initializer.expression;
    if (ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e)) return e.text;
    if (ts.isTemplateExpression(e)) return e.getText(sf); // approximate: raw text incl. expressions
  }
  return null;
}

// collect all JSX elements once
const jsxElements = [];
walk(sf, (n) => { if (ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n)) jsxElements.push(n); });

// ── A11Y-01 — aria-* must be real JSX attributes, not comment/string décor ──
{
  let realAria = false;
  for (const el of jsxElements) {
    for (const p of el.attributes.properties) {
      if (ts.isJsxAttribute(p) && p.name && p.name.getText(sf).startsWith("aria-")) realAria = true;
    }
  }
  const rawMention = /aria-\w+/.test(sourceText);
  checks["A11Y-01"] = !rawMention || realAria;
  if (!checks["A11Y-01"]) fail("A11Y-01", sf, "aria-* mentioned only in comments/strings — no real JSX aria attribute found");
}

// ── A11Y-02 — focus-visible classes belong on interactive elements ──────────
{
  let ok = true;
  for (const el of jsxElements) {
    const attrs = attrsOf(el);
    const cls = attrStringValue(attrs["className"]) || attrStringValue(attrs["class"]);
    if (!cls || !cls.includes("focus-visible")) continue;
    const tag = tagOf(el);
    if (tag === null) continue; // custom component — assume it forwards to an interactive element
    const interactive = INTERACTIVE.has(tag) || "tabIndex" in attrs || "onClick" in attrs || "onKeyDown" in attrs || "role" in attrs || "contentEditable" in attrs;
    if (!interactive) { ok = false; fail("A11Y-02", el, `focus-visible on non-interactive <${tag}> without tabIndex/role/handler`); }
  }
  checks["A11Y-02"] = ok;
}

// ── MOTION-01 — prefers-reduced-motion in functional context ────────────────
{
  const raw = sourceText.includes("prefers-reduced-motion");
  let functional = false;
  walk(sf, (n) => {
    if (functional) return;
    // useReducedMotion() hook
    if (ts.isCallExpression(n) && n.expression.getText(sf).endsWith("useReducedMotion")) functional = true;
    // matchMedia / mm.add / any call receiving the string as an argument
    if (ts.isCallExpression(n)) {
      for (const arg of n.arguments) {
        if ((ts.isStringLiteralLike(arg)) && arg.text.includes("prefers-reduced-motion")) functional = true;
      }
    }
    // CSS template literal containing a real @media block (e.g. <style> tags)
    if ((ts.isNoSubstitutionTemplateLiteral(n) || ts.isTemplateExpression(n))) {
      const txt = n.getText(sf);
      if (txt.includes("prefers-reduced-motion") && txt.includes("@media")) functional = true;
    }
    // string value of a JSX className with motion-reduce: variant (Tailwind)
  });
  if (sourceText.includes("motion-reduce:")) functional = true;
  // `framer-motion` is retained alongside `motion/react`: the package was renamed, but
  // detection must still fire on code written against either specifier. Additive only —
  // dropping the old token would silently stop MOTION-01 firing on existing sources.
  const animationPresent = /animate-|framer-motion|motion\/react|<motion\.|gsap|transition-|animation:/.test(sourceText);
  // Mirror ANI-01 conditionality: required only when animation exists; and if mentioned, must be functional.
  checks["MOTION-01"] = functional || (raw ? false : !animationPresent);
  if (!checks["MOTION-01"]) fail("MOTION-01", sf, raw
    ? "prefers-reduced-motion appears only in comments/inert strings — not in matchMedia, useReducedMotion, or a CSS @media block"
    : "animation present but no prefers-reduced-motion handling found");
}

// ── MOTION-02 — no ease-in for entrances (exit/leave context allowed) ───────
{
  let ok = true;
  const EASE_IN = /(^|[^\w-])ease-in(?!-out)(?![\w-])/;
  walk(sf, (n) => {
    if (!ts.isStringLiteralLike(n) && !ts.isTemplateExpression(n)) return;
    const txt = ts.isTemplateExpression(n) ? n.getText(sf) : n.text;
    if (!EASE_IN.test(txt)) return;
    // exit/leave/out context up the property chain → allowed
    const inExit = ancestors(n).some((a) =>
      (ts.isPropertyAssignment(a) && /exit|leave|out\b/i.test(a.name.getText(sf))) ||
      (ts.isVariableDeclaration(a) && /exit|leave|out/i.test(a.name.getText(sf)))
    );
    if (inExit) return;
    // entrance indicators nearby (opacity/transform/enter) or timing-function context → fail
    const timingCtx = /timing-function|transition|animation|ease-in\s/.test(txt) || ancestors(n).some((a) => ts.isPropertyAssignment(a) && /transition|animation|ease|enter/i.test(a.name.getText(sf)));
    if (timingCtx) { ok = false; fail("MOTION-02", n, "bare ease-in in entrance/timing context — use ease-out (enter) or scope to exit"); }
  });
  checks["MOTION-02"] = ok;
}

// ── TS-01-AST — declared *Props types are real and used ─────────────────────
{
  const typeDecls = [];
  walk(sf, (n) => { if (ts.isInterfaceDeclaration(n) || ts.isTypeAliasDeclaration(n)) typeDecls.push(n); });
  let ok = typeDecls.length > 0;
  if (!ok) fail("TS-01-AST", sf, "no interface/type declarations found");
  // every *Props declaration must be referenced somewhere beyond its declaration
  const refs = new Map();
  walk(sf, (n) => {
    if (ts.isTypeReferenceNode(n) && ts.isIdentifier(n.typeName)) refs.set(n.typeName.text, (refs.get(n.typeName.text) || 0) + 1);
    if (ts.isExpressionWithTypeArguments(n) && ts.isIdentifier(n.expression)) refs.set(n.expression.text, (refs.get(n.expression.text) || 0) + 1);
    if (ts.isHeritageClause(n)) for (const t of n.types) refs.set(t.expression.getText(sf), (refs.get(t.expression.getText(sf)) || 0) + 1);
  });
  for (const d of typeDecls) {
    const name = d.name.text;
    if (!name.endsWith("Props")) continue;
    if (!refs.get(name)) { ok = false; fail("TS-01-AST", d, `${name} is declared but never used as a type — dead 'compliance' declaration`); }
  }
  checks["TS-01-AST"] = ok;
}

// ── COL-02-AST — white backgrounds banned on page containers only ───────────
{
  let ok = true;
  const WHITE = /\bbg-white\b|bg-\[#fff(?:fff)?\]/i;
  const PAGE_TAGS = new Set(["body", "main", "html", "section"]);
  for (const el of jsxElements) {
    const attrs = attrsOf(el);
    const cls = attrStringValue(attrs["className"]) || attrStringValue(attrs["class"]);
    if (!cls || !WHITE.test(cls)) continue;
    const tag = tagOf(el);
    if (tag === null) continue;
    let isPage = PAGE_TAGS.has(tag);
    if (tag === "div") {
      // top-level div (no enclosing JSX element) or direct child of body/main/section
      const parentEl = ancestors(el).find((a) => ts.isJsxElement(a));
      const grandEl = parentEl ? ancestors(parentEl).find((a) => ts.isJsxElement(a)) : null;
      const parentTag = grandEl && tagOf(grandEl.openingElement);
      if (!grandEl || PAGE_TAGS.has(parentTag || "")) isPage = true;
      if ("onClick" in attrs || "role" in attrs) isPage = false;
    }
    if (isPage) { ok = false; fail("COL-02-AST", el, `white background on page container <${tag}> — use an OKLCH off-white surface token`); }
  }
  checks["COL-02-AST"] = ok;
}

// ── DELAY-01-AST — no mount-time fake loading delays ────────────────────────
{
  let ok = true;
  walk(sf, (n) => {
    if (!ts.isCallExpression(n)) return;
    const callee = n.expression.getText(sf);
    if (callee !== "setTimeout" && callee !== "setInterval") return;
    const chain = ancestors(n);
    // intermediate named handler => event context, allowed
    const handlerBoundary = chain.some((a) =>
      (ts.isFunctionDeclaration(a) || ts.isFunctionExpression(a)) && a.name && /^(handle|on[A-Z]|show|dismiss|reset|retry|copy)/i.test(a.name.text) ||
      (ts.isVariableDeclaration(a) && /^(handle|on[A-Z]|show|dismiss|reset|retry|copy)/i.test(a.name.getText(sf)) && a.initializer && (ts.isArrowFunction(a.initializer) || ts.isFunctionExpression(a.initializer)))
    );
    if (handlerBoundary) return;
    // is an ancestor a useEffect(fn, []) mount effect?
    const mountEffect = chain.find((a) =>
      ts.isCallExpression(a) &&
      /(^|\.)useEffect$/.test(a.expression.getText(sf)) &&
      a.arguments.length >= 2 &&
      ts.isArrayLiteralExpression(a.arguments[1]) &&
      a.arguments[1].elements.length === 0
    );
    if (!mountEffect) return;
    // does the timer callback set state? (any set* / dispatch call)
    let setsState = false;
    const cb = n.arguments[0];
    if (cb) walk(cb, (m) => {
      if (ts.isCallExpression(m)) {
        const c = m.expression.getText(sf);
        if (/^set[A-Z]/.test(c) || /dispatch/.test(c)) setsState = true;
      }
    });
    if (setsState) { ok = false; fail("DELAY-01-AST", n, "setTimeout gating state inside a mount useEffect — artificial loading delay (drive skeletons from real async)"); }
  });
  checks["DELAY-01-AST"] = ok;
}

// ── COMP-01 — forwardRef, when present, is used correctly ────────────────────
{
  let imported = false, called = 0, ok = true;
  walk(sf, (n) => {
    if (ts.isImportSpecifier(n) && n.name.text === "forwardRef") imported = true;
  });
  if (/React\.forwardRef/.test(sourceText)) imported = true;
  walk(sf, (n) => {
    if (!ts.isCallExpression(n)) return;
    const callee = n.expression.getText(sf);
    if (callee !== "forwardRef" && callee !== "React.forwardRef") return;
    called++;
    const impl = n.arguments[0];
    if (!impl || !(ts.isArrowFunction(impl) || ts.isFunctionExpression(impl))) {
      ok = false; fail("COMP-01", n, "forwardRef first argument must be a function"); return;
    }
    if (impl.parameters.length < 2) { ok = false; fail("COMP-01", impl, "forwardRef render function must take (props, ref)"); }
    let returnsJsx = false;
    if (impl.body && !ts.isBlock(impl.body)) {
      returnsJsx = ts.isJsxElement(impl.body) || ts.isJsxSelfClosingElement(impl.body) || ts.isParenthesizedExpression(impl.body);
    } else if (impl.body) {
      walk(impl.body, (m) => { if (ts.isReturnStatement(m) && m.expression) returnsJsx = true; });
    }
    if (!returnsJsx) { ok = false; fail("COMP-01", impl, "forwardRef render function must return JSX"); }
    // exported?
    const decl = ancestors(n).find((a) => ts.isVariableStatement(a));
    const exported = (decl && decl.modifiers && decl.modifiers.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) || /export default/.test(sourceText);
    if (!exported) { ok = false; fail("COMP-01", n, "forwardRef component must be exported"); }
  });
  if (imported && called === 0) { ok = false; fail("COMP-01", sf, "forwardRef imported but never called"); }
  checks["COMP-01"] = ok;
}


// ── PERF-01 — no barrel-file imports ────────────────────────────────────────
{
  let ok = true;
  walk(sf, (n) => {
    if (!ts.isImportDeclaration(n) || !ts.isStringLiteral(n.moduleSpecifier)) return;
    const spec = n.moduleSpecifier.text;
    if (/(^|\/)(index)$/.test(spec) || /^@\/(components|lib|ui|utils)$/.test(spec) || /^\.\/?$/.test(spec)) {
      ok = false; fail("PERF-01", n, `barrel import '${spec}' — import the module directly (bundle-barrel-imports)`);
    }
  });
  checks["PERF-01"] = ok;
}

// ── PERF-02 — ternary, not && , for JSX conditional rendering ───────────────
{
  let ok = true;
  walk(sf, (n) => {
    if (!ts.isJsxExpression(n) || !n.expression) return;
    const e = n.expression;
    if (!ts.isBinaryExpression(e) || e.operatorToken.kind !== ts.SyntaxKind.AmpersandAmpersandToken) return;
    // Narrowed to the real footgun: a NUMERIC left side renders a literal "0" in the DOM
    // (`items.length && <List/>` → "0" when empty). Object/string/undefined left sides render
    // nothing and are idiomatic React, so flagging them would be churn, not a fix.
    const l = e.left;
    const numericRisk =
      /\.length$/.test(l.getText(sf)) ||
      ts.isNumericLiteral(l) ||
      (ts.isBinaryExpression(l) && [ts.SyntaxKind.PlusToken, ts.SyntaxKind.MinusToken,
        ts.SyntaxKind.AsteriskToken, ts.SyntaxKind.SlashToken].includes(l.operatorToken.kind));
    if (!numericRisk) return;
    const boolish =
      (ts.isBinaryExpression(l) && [ts.SyntaxKind.GreaterThanToken, ts.SyntaxKind.LessThanToken,
        ts.SyntaxKind.GreaterThanEqualsToken, ts.SyntaxKind.LessThanEqualsToken,
        ts.SyntaxKind.EqualsEqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsEqualsToken,
        ts.SyntaxKind.EqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsToken,
        ts.SyntaxKind.AmpersandAmpersandToken, ts.SyntaxKind.BarBarToken].includes(l.operatorToken.kind)) ||
      ts.isPrefixUnaryExpression(l) && l.operator === ts.SyntaxKind.ExclamationToken ||
      (ts.isCallExpression(l) && l.expression.getText(sf) === "Boolean") ||
      l.kind === ts.SyntaxKind.TrueKeyword || l.kind === ts.SyntaxKind.FalseKeyword;
    if (!boolish) {
      ok = false; fail("PERF-02", n, "numeric `&&` left side renders a literal 0 — use a ternary or `> 0` (rendering-conditional-render)");
    }
  });
  checks["PERF-02"] = ok;
}

// ── PERF-04 — no `transition: all` / `transition-all` ──────────────────────
{
  let ok = true;
  walk(sf, (n) => {
    if (!ts.isStringLiteralLike(n) && !ts.isTemplateExpression(n)) return;
    const txt = ts.isTemplateExpression(n) ? n.getText(sf) : n.text;
    if (/\btransition-all\b/.test(txt) || /transition:\s*all\b/.test(txt)) {
      ok = false; fail("PERF-04", n, "`transition: all` — list animated properties explicitly");
    }
  });
  checks["PERF-04"] = ok;
}

// ── A11Y-03 — images carry explicit dimensions ─────────────────────────────
{
  let ok = true;
  for (const el of jsxElements) {
    const tag = el.tagName.getText(sf);
    if (tag !== "img" && tag !== "Image") continue;
    const attrs = attrsOf(el);
    const sized = ("width" in attrs && "height" in attrs) || "fill" in attrs;
    if (!sized) { ok = false; fail("A11Y-03", el, `<${tag}> without width/height (or fill) — causes layout shift (CLS)`); }
  }
  checks["A11Y-03"] = ok;
}

// ── COPY-01 — no "..." in user-visible UI text ─────────────────────────────
{
  let ok = true;
  walk(sf, (n) => {
    if (ts.isJsxText(n) && n.text.includes("...")) {
      ok = false; fail("COPY-01", n, 'literal "..." in UI text — use the ellipsis character "…"');
    }
    if (ts.isJsxExpression(n) && n.expression && ts.isStringLiteralLike(n.expression) && n.expression.text.includes("...")) {
      ok = false; fail("COPY-01", n, 'literal "..." in UI text — use "…"');
    }
    // string attribute values that are user-visible copy
    if (ts.isJsxAttribute(n) && n.name && /^(aria-label|title|placeholder|alt)$/.test(n.name.getText(sf))) {
      const v = attrStringValue(n);
      if (v && v.includes("...")) { ok = false; fail("COPY-01", n, `"..." in ${n.name.getText(sf)} — use "…"`); }
    }
  });
  checks["COPY-01"] = ok;
}


// ── 3D-01 — R3F <Canvas> declares a responsive dpr ─────────────────────────
{
  let ok = true;
  for (const el of jsxElements) {
    if (el.tagName.getText(sf) !== "Canvas") continue;
    if (!("dpr" in attrsOf(el))) { ok = false; fail("3D-01", el, "<Canvas> without dpr — cap the pixel ratio, e.g. dpr={[1, 2]}"); }
  }
  checks["3D-01"] = ok;
}

// ── 3D-02 — no raw requestAnimationFrame in an R3F file ───────────────────
{
  let ok = true;
  const isR3F = /@react-three\/(fiber|drei)/.test(sourceText);
  if (isR3F) walk(sf, (n) => {
    if (ts.isCallExpression(n) && /(^|\.)requestAnimationFrame$/.test(n.expression.getText(sf))) {
      ok = false; fail("3D-02", n, "raw requestAnimationFrame in an R3F component — use useFrame((state, delta) => …)");
    }
  });
  checks["3D-02"] = ok;
}

// ── 3D-03 — manual geometry/material construction is memoized ─────────────
{
  let ok = true;
  walk(sf, (n) => {
    if (!ts.isNewExpression(n)) return;
    const cls = n.expression.getText(sf);
    if (!/^THREE\.\w*(Geometry|Material)$/.test(cls)) return;
    const memoized = ancestors(n).some((a) =>
      ts.isCallExpression(a) && /(^|\.)(useMemo|useState|useRef|useEffect|useLayoutEffect)$/.test(a.expression.getText(sf)));
    const moduleScope = !ancestors(n).some((a) => ts.isFunctionDeclaration(a) || ts.isArrowFunction(a) || ts.isFunctionExpression(a));
    if (!memoized && !moduleScope) {
      ok = false; fail("3D-03", n, `new ${cls}() in a component body — wrap in useMemo or it is rebuilt every render`);
    }
  });
  checks["3D-03"] = ok;
}

console.log(JSON.stringify({ file, checks, errors }, null, 1));
process.exit(errors.length ? 1 : 0);
