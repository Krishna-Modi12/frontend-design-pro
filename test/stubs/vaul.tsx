// Runtime stub for `vaul`. See ./README.md for why these exist.
//
// The drawer renders open and inline. Vaul's real value is a drag-to-dismiss
// sheet driven by pointer velocity, none of which jsdom can produce — but the
// content, its dialog role and its title are assertable, and hiding them behind
// an interaction that cannot happen would make the golds untestable.
import * as React from 'react';

type AnyProps = Record<string, unknown>;

const frag = ({ children }: AnyProps) =>
  React.createElement(React.Fragment, null, children as React.ReactNode);

const el = (tag: string, extra: AnyProps = {}) => ({ children, ...rest }: AnyProps) =>
  React.createElement(tag, { ...extra, ...rest }, children as React.ReactNode);

const Root = frag;

export const Drawer = Object.assign(Root, {
  Root,
  NestedRoot: Root,
  Portal: frag,
  Trigger: ({ children, asChild: _a, ...rest }: AnyProps) =>
    React.createElement('button', { type: 'button', ...rest }, children as React.ReactNode),
  Overlay: el('div'),
  Content: ({ children, ...rest }: AnyProps) =>
    React.createElement('div', { role: 'dialog', 'aria-modal': 'true', ...rest }, children as React.ReactNode),
  Handle: el('div'),
  Title: el('h2'),
  Description: el('p'),
  Close: ({ children, asChild: _a, ...rest }: AnyProps) =>
    React.createElement('button', { type: 'button', ...rest }, children as React.ReactNode),
});
