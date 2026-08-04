// Runtime stub for `@/components/ui/*` and `@/lib/utils`. See ./README.md.
//
// These are project-local shadcn/ui paths: in a real consumer project the
// components exist because `shadcn add` copied them in. In this repo they are
// deliberately absent — the gold examples demonstrate *how to compose* shadcn
// primitives, and vendoring the whole kit to make them importable would ship a
// UI library inside a markdown skill pack.
//
// So these render the semantically correct element with props forwarded, which
// is what the tests query on: a Button is a real <button>, TableCell is a real
// <td>, FormLabel is a real <label>. Radix behaviour (portals, focus traps,
// typeahead) is not modelled — assertions that depend on it belong in a
// project that has the real components.
//
// One exception, and it is not optional: the ARIA *relationships* Radix wires up
// automatically are modelled here. A `role="dialog"` with no `aria-labelledby` is
// an axe violation, and emitting one from the stub would fail a gold for a defect
// that only exists in the stub. Naming a role means owning its name.
import * as React from 'react';

type AnyProps = Record<string, unknown>;

const el =
  (tag: string, extra: AnyProps = {}) =>
  ({ children, asChild: _asChild, ...rest }: AnyProps) =>
    React.createElement(tag, { ...extra, ...rest }, children as React.ReactNode);

const passthrough = ({ children }: AnyProps) =>
  React.createElement(React.Fragment, null, children as React.ReactNode);

// ── @/lib/utils ──────────────────────────────────────────────────────────────
export const cn = (...parts: unknown[]) =>
  parts
    .flatMap((p) =>
      typeof p === 'string' ? p
      : Array.isArray(p) ? p
      : p && typeof p === 'object' ? Object.entries(p).filter(([, v]) => v).map(([k]) => k)
      : [],
    )
    .filter(Boolean)
    .join(' ');

// ── button / badge / input ───────────────────────────────────────────────────
export const Button = React.forwardRef<HTMLButtonElement, AnyProps>(
  ({ children, asChild: _a, variant: _v, size: _s, ...rest }, ref) =>
    React.createElement('button', { type: 'button', ...rest, ref }, children as React.ReactNode),
);
Button.displayName = 'Button';

export const Badge = ({ children, variant: _v, ...rest }: AnyProps) =>
  React.createElement('span', rest, children as React.ReactNode);

export const Input = React.forwardRef<HTMLInputElement, AnyProps>((props, ref) =>
  React.createElement('input', { ...props, ref }),
);
Input.displayName = 'Input';

// ── table ────────────────────────────────────────────────────────────────────
export const Table = el('table');
export const TableHeader = el('thead');
export const TableBody = el('tbody');
export const TableRow = el('tr');
export const TableHead = el('th');
export const TableCell = el('td');

// ── dialog ───────────────────────────────────────────────────────────────────
// Radix labels the dialog by its title. The ids are shared through context so a
// second dialog in one tree still gets its own pair; the default value keeps a
// bare <DialogContent> outside a <Dialog> working, which is how some golds
// compose it.
const DialogIds = React.createContext({ titleId: 'stub-dialog-title' });

export const Dialog = ({ children }: AnyProps) => {
  const titleId = React.useId();
  const value = React.useMemo(() => ({ titleId }), [titleId]);
  return React.createElement(DialogIds.Provider, { value }, children as React.ReactNode);
};

export const DialogTrigger = passthrough;

export const DialogContent = ({ children, ...rest }: AnyProps) => {
  const { titleId } = React.useContext(DialogIds);
  return React.createElement(
    'div',
    { role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': titleId, ...rest },
    children as React.ReactNode,
  );
};

export const DialogHeader = el('div');
export const DialogFooter = el('div');

export const DialogTitle = ({ children, ...rest }: AnyProps) => {
  const { titleId } = React.useContext(DialogIds);
  return React.createElement('h2', { id: titleId, ...rest }, children as React.ReactNode);
};

export const DialogDescription = el('p');

// ── dropdown menu ────────────────────────────────────────────────────────────
export const DropdownMenu = passthrough;
export const DropdownMenuTrigger = passthrough;
export const DropdownMenuContent = ({ children, ...rest }: AnyProps) =>
  React.createElement('div', { role: 'menu', ...rest }, children as React.ReactNode);
export const DropdownMenuItem = ({ children, ...rest }: AnyProps) =>
  React.createElement('div', { role: 'menuitem', ...rest }, children as React.ReactNode);
export const DropdownMenuSeparator = () => React.createElement('hr', { role: 'separator' });

// ── select ───────────────────────────────────────────────────────────────────
// Same rule as the dialog: Radix names the listbox after the trigger that opens
// it, so the stub does too rather than emitting an unnamed ARIA input field.
const SelectIds = React.createContext({
  triggerId: 'stub-select-trigger',
  contentId: 'stub-select-content',
  valueId: 'stub-select-value',
});

export const Select = ({ children }: AnyProps) => {
  const base = React.useId();
  const value = React.useMemo(
    () => ({ triggerId: `${base}-trigger`, contentId: `${base}-content`, valueId: `${base}-value` }),
    [base],
  );
  return React.createElement(SelectIds.Provider, { value }, children as React.ReactNode);
};

// `role="combobox"` obliges `aria-expanded` and `aria-controls`, and it is not
// named from its contents — so the visible value has to be referenced explicitly.
// Radix does all three; a stub that takes the role without them invents three axe
// violations in every gold that renders a Select.
export const SelectTrigger = ({ children, ...rest }: AnyProps) => {
  const { triggerId, contentId, valueId } = React.useContext(SelectIds);
  return React.createElement(
    'button',
    {
      type: 'button',
      role: 'combobox',
      id: triggerId,
      'aria-expanded': false,
      'aria-controls': contentId,
      'aria-labelledby': valueId,
      ...rest,
    },
    children as React.ReactNode,
  );
};

// The real SelectValue shows `placeholder` until something is chosen, and carries
// the id the trigger is labelled by.
export const SelectValue = ({ children, placeholder, ...rest }: AnyProps) => {
  const { valueId } = React.useContext(SelectIds);
  return React.createElement(
    'span',
    { id: valueId, ...rest },
    (children as React.ReactNode) ?? (placeholder as React.ReactNode) ?? null,
  );
};

export const SelectContent = ({ children, ...rest }: AnyProps) => {
  const { triggerId, contentId } = React.useContext(SelectIds);
  return React.createElement(
    'div',
    { role: 'listbox', id: contentId, 'aria-labelledby': triggerId, ...rest },
    children as React.ReactNode,
  );
};

export const SelectItem = ({ children, value: _v, ...rest }: AnyProps) =>
  React.createElement('div', { role: 'option', ...rest }, children as React.ReactNode);

// ── popover / command ────────────────────────────────────────────────────────
export const Popover = passthrough;
export const PopoverTrigger = passthrough;
export const PopoverContent = el('div');
export const Command = el('div');
export const CommandInput = (props: AnyProps) => React.createElement('input', props);
// cmdk labels its list "Suggestions" by default; the spread lets a gold override
// it, which is what a gold with a more specific label should do.
export const CommandList = ({ children, ...rest }: AnyProps) =>
  React.createElement('div', { role: 'listbox', 'aria-label': 'Suggestions', ...rest }, children as React.ReactNode);
export const CommandEmpty = el('div');
export const CommandGroup = el('div');
export const CommandItem = ({ children, ...rest }: AnyProps) =>
  React.createElement('div', { role: 'option', ...rest }, children as React.ReactNode);

// ── form (shadcn's react-hook-form wrapper) ──────────────────────────────────
export const Form = passthrough;
export const FormItem = el('div');
export const FormLabel = el('label');
export const FormControl = passthrough;
export const FormMessage = el('p');
export const FormField = ({ render }: AnyProps) =>
  React.createElement(
    React.Fragment,
    null,
    (render as ((a: AnyProps) => React.ReactNode) | undefined)?.({
      field: { value: '', onChange: () => {}, onBlur: () => {}, name: '', ref: () => {} },
      fieldState: {},
      formState: {},
    }),
  );
