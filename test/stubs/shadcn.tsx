// Runtime stubs for `@/components/ui/*` and `@/lib/utils`.
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
export const Dialog = passthrough;
export const DialogTrigger = passthrough;
export const DialogContent = ({ children, ...rest }: AnyProps) =>
  React.createElement('div', { role: 'dialog', ...rest }, children as React.ReactNode);
export const DialogHeader = el('div');
export const DialogFooter = el('div');
export const DialogTitle = el('h2');
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
export const Select = passthrough;
export const SelectTrigger = ({ children, ...rest }: AnyProps) =>
  React.createElement('button', { type: 'button', role: 'combobox', ...rest }, children as React.ReactNode);
export const SelectValue = el('span');
export const SelectContent = ({ children, ...rest }: AnyProps) =>
  React.createElement('div', { role: 'listbox', ...rest }, children as React.ReactNode);
export const SelectItem = ({ children, value: _v, ...rest }: AnyProps) =>
  React.createElement('div', { role: 'option', ...rest }, children as React.ReactNode);

// ── popover / command ────────────────────────────────────────────────────────
export const Popover = passthrough;
export const PopoverTrigger = passthrough;
export const PopoverContent = el('div');
export const Command = el('div');
export const CommandInput = (props: AnyProps) => React.createElement('input', props);
export const CommandList = ({ children, ...rest }: AnyProps) =>
  React.createElement('div', { role: 'listbox', ...rest }, children as React.ReactNode);
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
