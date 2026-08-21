# Token Optimization for React/Next.js UIs

A reference for AI agents building UIs efficiently. Every line counts — write less, mean more.

---

## Contents

- [1. Component Token Budget](#1-component-token-budget)
- [2. State Initialization Patterns](#2-state-initialization-patterns)
- [3. Conditional Rendering Shortcuts](#3-conditional-rendering-shortcuts)
- [4. Tailwind Class Compression](#4-tailwind-class-compression)
- [5. Type Inference](#5-type-inference)
- [6. Import Optimization](#6-import-optimization)
- [7. Data Structure Efficiency](#7-data-structure-efficiency)
- [8. Comment Discipline](#8-comment-discipline)
- [9. Token Budget Table](#9-token-budget-table)
- [10. Anti-Patterns](#10-anti-patterns)
- [Quick Reference: cn() Setup](#quick-reference-cn-setup)
- [Checklist Before Submitting a Component](#checklist-before-submitting-a-component)
- [Token Optimization for LLM UI Generation](#token-optimization-for-llm-ui-generation)

---

## 1. Component Token Budget

**Bad — unnecessary wrapping, verbose props:**
```tsx
const Button = (props: ButtonProps) => {
  const { children, onClick, disabled, variant, size, className } = props;
  return (
    <div className="button-wrapper">
      <button
        className={`btn btn-${variant} btn-${size} ${className}`}
        onClick={onClick}
        disabled={disabled}
      >
        <span>{children}</span>
      </button>
    </div>
  );
};
```

**Good — inline destructure, cn(), no wrapper div:**
```tsx
const Button = ({ children, onClick, disabled, variant = 'primary', size = 'md', className }: ButtonProps) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={cn('rounded font-medium transition-colors', variants[variant], sizes[size], className)}
  >
    {children}
  </button>
);
```

**Rules:**
- Destructure props in the function signature, not the body
- No wrapper `<div>` unless layout requires it
- `cn()` (clsx + tailwind-merge) for all className composition
- Single-expression components use implicit return `() => (...)`
- Merge variant maps outside the component: `const variants = { primary: '...', ghost: '...' }`

---

## 2. State Initialization Patterns

**Bad — verbose, split state:**
```tsx
const [firstName, setFirstName] = useState('');
const [lastName, setLastName] = useState('');
const [email, setEmail] = useState('');
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

**Good — grouped, typed once:**
```tsx
const [form, setForm] = useState({ firstName: '', lastName: '', email: '' });
const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
const [error, setError] = useState('');

// Update a single field:
setForm(f => ({ ...f, email: value }));
```

**useReducer for complex state — one type, one dispatch:**
```tsx
type Action =
  | { type: 'SET_FIELD'; field: keyof FormState; value: string }
  | { type: 'SUBMIT' }
  | { type: 'ERROR'; message: string };

const reducer = (state: FormState, action: Action): FormState => {
  switch (action.type) {
    case 'SET_FIELD': return { ...state, [action.field]: action.value };
    case 'SUBMIT':    return { ...state, status: 'loading' };
    case 'ERROR':     return { ...state, status: 'error', error: action.message };
    default:          return state;
  }
};
```

**Rules:**
- Group related primitive state into one object
- Use discriminated union status: `'idle' | 'loading' | 'error' | 'success'`
- Never store derived values — compute them inline
- `useReducer` when state transitions have 3+ branches

---

## 3. Conditional Rendering Shortcuts

**Bad — verbose JSX conditionals:**
```tsx
{isLoggedIn ? (
  <div>
    <UserMenu />
  </div>
) : (
  <div>
    <LoginButton />
  </div>
)}
```

**Good — short-circuit for presence, ternary for either/or:**
```tsx
{isLoggedIn && <UserMenu />}
{!isLoggedIn && <LoginButton />}

// Or ternary when both branches exist:
{isLoggedIn ? <UserMenu /> : <LoginButton />}
```

**Null guard pattern — avoid nested ternaries:**
```tsx
// Bad
{user ? (user.role === 'admin' ? <AdminPanel /> : <UserPanel />) : <LoginButton />}

// Good — early return in component or extract to variable
const Panel = () => {
  if (!user) return <LoginButton />;
  return user.role === 'admin' ? <AdminPanel /> : <UserPanel />;
};
```

**List rendering — inline when simple:**
```tsx
// Bad
const items = data.map((item) => { return <Item key={item.id} {...item} />; });
return <ul>{items}</ul>;

// Good
<ul>{data.map(item => <Item key={item.id} {...item} />)}</ul>
```

**Rules:**
- `&&` for optional presence; ternary for binary branches
- Extract to variable or component when ternary nests more than once
- Avoid `{condition === true &&` — just `{condition &&`
- Empty state via `|| <EmptyState />` at the end of an expression when natural

---

## 4. Tailwind Class Compression

**Bad — repeated classes across variants:**
```tsx
<button className="px-4 py-2 rounded font-medium text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
<button className="px-4 py-2 rounded font-medium text-white bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
```

**Good — `@apply` base + variant maps:**
```css
/* globals.css */
@layer components {
  .btn { @apply px-4 py-2 rounded font-medium transition-colors focus:ring-2 focus:ring-offset-2; }
}
```
```tsx
const colors = {
  blue: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white',
  red:  'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white',
};
<button className={cn('btn', colors[color])} />
```

**group/peer variants — avoid JS state for CSS interaction:**
```tsx
// Bad — JS hover state
const [hovered, setHovered] = useState(false);
<div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
  <span className={hovered ? 'opacity-100' : 'opacity-0'}>Reveal</span>
</div>

// Good — CSS group
<div className="group">
  <span className="opacity-0 group-hover:opacity-100 transition-opacity">Reveal</span>
</div>
```

**peer for sibling state (checkbox/input → label):**
```tsx
<input type="checkbox" className="peer sr-only" />
<label className="border peer-checked:border-blue-500 peer-checked:bg-blue-50">Option</label>
```

**Rules:**
- `@apply` for 4+ classes repeated 3+ times
- `group-*` / `peer-*` variants replace JS hover/focus state
- `cn()` deduplications: pass conflicting classes last to win
- Never duplicate responsive prefix logic — factor into a variant map
- `data-[state=open]:` and `aria-[selected=true]:` for component state from headless libs

---

## 5. Type Inference

**Bad — redundant explicit types:**
```tsx
const [count, setCount] = useState<number>(0);
const items: Array<string> = ['a', 'b', 'c'];
const double = (n: number): number => n * 2;
const onClick: React.MouseEventHandler<HTMLButtonElement> = (e: React.MouseEvent<HTMLButtonElement>) => {};
```

**Good — let TypeScript infer:**
```tsx
const [count, setCount] = useState(0);           // infers number
const items = ['a', 'b', 'c'];                   // infers string[]
const double = (n: number) => n * 2;             // return type inferred
const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {};
```

**Annotate only when inference fails or narrows too wide:**
```tsx
const [user, setUser] = useState<User | null>(null);     // null needs help
const [status, setStatus] = useState<Status>('idle');    // literal union needs help
const ref = useRef<HTMLInputElement>(null);               // DOM ref needs type
```

**Component props — avoid redundant interfaces:**
```tsx
// Bad — interface adds no value here
interface IconProps { size: number; className?: string; }
const Icon = ({ size, className }: IconProps) => ...

// Good — inline type for small components
const Icon = ({ size, className }: { size: number; className?: string }) => ...

// Use interface when extending or when reused across files
interface CardProps extends React.HTMLAttributes<HTMLDivElement> { title: string; }
```

**Utility types — derive rather than redeclare:**
```tsx
type CreateUserInput = Omit<User, 'id' | 'createdAt'>;
type UserPreview = Pick<User, 'id' | 'name' | 'avatar'>;
type PartialConfig = Partial<Config>;
```

---

## 6. Import Optimization

**Bad — barrel imports import everything:**
```tsx
import { Button, Card, Input, Badge, Avatar } from '@/components';
// Barrel re-exports everything — bundler may not tree-shake
```

**Good — direct named imports:**
```tsx
import { Button } from '@/components/button';
import { Card } from '@/components/card';
```

**Dynamic imports for heavy components:**
```tsx
// Bad — loads on initial bundle
import { RichTextEditor } from '@/components/rich-text-editor';

// Good — loads only when rendered
const RichTextEditor = dynamic(() => import('@/components/rich-text-editor'), {
  loading: () => <Skeleton className="h-40" />,
  ssr: false,
});
```

**Suspend-safe lazy loading (React 18+):**
```tsx
const Chart = lazy(() => import('@/components/chart'));

<Suspense fallback={<ChartSkeleton />}>
  <Chart data={data} />
</Suspense>
```

**Side-effect-only imports — be explicit:**
```tsx
import '@/styles/globals.css';    // clear intent
import 'server-only';             // enforce module boundary
```

**Rules:**
- Direct imports over barrel for code-split boundaries
- `dynamic()` for: charts, rich text editors, map components, modals not in critical path
- Group imports: React → third-party → internal → styles
- Never import a full icon library — import individual icons
  ```tsx
  // Bad
  import * as Icons from 'lucide-react';
  // Good
  import { Search, X, ChevronDown } from 'lucide-react';
  ```

---

## 7. Data Structure Efficiency

**Bad — deeply nested, redundant state:**
```tsx
const [data, setData] = useState({
  user: {
    profile: {
      name: '',
      settings: {
        theme: 'light',
        notifications: { email: true, push: false }
      }
    }
  }
});
// Updating nested: setData(d => ({ ...d, user: { ...d.user, profile: { ...d.user.profile, ... }}}))
```

**Good — flat, targeted:**
```tsx
const [userName, setUserName] = useState('');
const [theme, setTheme] = useState<'light' | 'dark'>('light');
const [notifications, setNotifications] = useState({ email: true, push: false });
```

**Derive, don't store:**
```tsx
// Bad — stores derived value
const [items, setItems] = useState([]);
const [filteredItems, setFilteredItems] = useState([]);
useEffect(() => setFilteredItems(items.filter(i => i.active)), [items]);

// Good — compute inline (useMemo if expensive)
const filteredItems = useMemo(() => items.filter(i => i.active), [items]);
```

**Normalize list data when frequently looked up by ID:**
```tsx
// Bad — O(n) lookup
const getUser = (id: string) => users.find(u => u.id === id);

// Good — O(1) lookup
const usersById = useMemo(
  () => Object.fromEntries(users.map(u => [u.id, u])),
  [users]
);
```

**Server state — TanStack Query handles cache, loading, error:**
```tsx
// Don't duplicate server state into useState
const { data: users, isLoading, error } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
});
```

---

## 8. Comment Discipline

**Write intent, not mechanics:**
```tsx
// Bad — describes what the code obviously does
// Map over users and return JSX elements
{users.map(user => <UserCard key={user.id} user={user} />)}

// Bad — placeholder TODO with no owner or ticket
// TODO: fix this later

// Good — explains why, not what
// Offset by 1 because API pagination is 1-indexed
const page = currentPage + 1;

// Good — explains non-obvious constraint
// useLayoutEffect to avoid flash before measuring
useLayoutEffect(() => measure(ref.current), []);
```

**When to comment:**
- Non-obvious algorithmic choice
- Business rule that isn't in the code name
- Workaround for a known browser/library bug (include issue URL)
- Public API surface (JSDoc on exported functions/components)

**When not to comment:**
- Self-documenting names: `const isExpired = Date.now() > expiresAt`
- Standard patterns: `useState`, `useEffect`, `map`
- Anything that duplicates the type signature

**JSDoc only on exported public API:**
```tsx
/**
 * Formats a price in cents to a locale-aware string.
 * @param cents - integer amount in cents
 * @param currency - ISO 4217 code, defaults to 'USD'
 */
export const formatPrice = (cents: number, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(cents / 100);
```

---

## 9. Token Budget Table

Target line counts for common components. Includes types, logic, JSX — excludes import block.

| Component         | Lines | Notes |
|-------------------|-------|-------|
| Icon wrapper      | 8–12  | size + className props, SVG passthrough |
| Badge             | 10–15 | variant map + cn(), no logic |
| Button            | 15–25 | variants, sizes, loading state, disabled |
| Avatar            | 15–20 | image + fallback initials |
| Input             | 20–30 | label, error, helper text, ref forward |
| Card              | 25–40 | header/body/footer slots via children |
| Modal/Dialog      | 35–55 | Radix Dialog wrapper, portal, overlay |
| Dropdown Menu     | 30–50 | trigger + items, keyboard nav via Radix |
| Toast             | 20–35 | message, variant, auto-dismiss |
| Data Table row    | 15–25 | cells, selection, actions column |
| Form (3 fields)   | 60–90 | RHF, zod schema, error display |
| Auth page         | 80–120| form + social login + redirect logic |
| Dashboard page    | 150–250| layout + multiple data-fetching sections |
| Full CRUD page    | 200–350| list + create + edit + delete flows |

**Overage signals:** >1.5x budget usually means extractable subcomponent or missing abstraction.

---

## 10. Anti-Patterns

### Verbose boilerplate
```tsx
// Bad — every prop typed and defaulted separately
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
}
const Button: React.FC<ButtonProps> = ({
  children,
  onClick = undefined,
  type = 'button',
  disabled = false,
  className = '',
}) => { ... };

// Good — lean, defaults inline
const Button = ({ children, onClick, type = 'button', disabled, className }: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
}) => { ... };
```

### Over-abstracted HOCs
```tsx
// Bad — wraps a single concern in 3 layers
const withAuth = (Component) => (props) => {
  const { user } = useAuth();
  if (!user) return <Redirect to="/login" />;
  return <Component {...props} user={user} />;
};
const withLoading = (Component) => (props) => { ... };
const ProtectedDashboard = withAuth(withLoading(Dashboard));

// Good — hooks compose cleanly
const Dashboard = () => {
  const { user } = useRequireAuth();       // redirects internally
  const { data, isLoading } = useDashboardData();
  if (isLoading) return <DashboardSkeleton />;
  return <DashboardContent data={data} user={user} />;
};
```

### Redundant prop drilling vs context
```tsx
// Bad — theme passed 4 levels deep
<Page theme={theme}>
  <Layout theme={theme}>
    <Sidebar theme={theme}>
      <NavItem theme={theme} />

// Good — context or CSS variable at root
// globals.css: :root { --color-primary: ... }  switched via data-theme
// or: <ThemeProvider> with useTheme() hook at consumption point
```

### useEffect for derived state
```tsx
// Bad
const [fullName, setFullName] = useState('');
useEffect(() => setFullName(`${first} ${last}`), [first, last]);

// Good — compute directly
const fullName = `${first} ${last}`;
```

### Untyped event handlers
```tsx
// Bad
const handleChange = (e: any) => setVal(e.target.value);

// Good
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setVal(e.target.value);
// Or with RHF: just pass register('fieldName') — no handler needed
```

### Importing entire modules for one utility
```tsx
// Bad
import _ from 'lodash';
const grouped = _.groupBy(items, 'category');

// Good — native or single-function import
const grouped = Object.groupBy(items, i => i.category);  // ES2024
// or: import groupBy from 'lodash/groupBy';
```

### Inline anonymous objects/arrays as props (rerenders)
```tsx
// Bad — new reference on every render
<Component style={{ marginTop: 8 }} options={['a', 'b']} />

// Good — stable reference outside component
const STYLE = { marginTop: 8 } as const;
const OPTIONS = ['a', 'b'] as const;
<Component style={STYLE} options={OPTIONS} />
```

---

## Quick Reference: cn() Setup

```tsx
// lib/utils.ts — standard pattern
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
```

Usage — last class wins on conflict:
```tsx
cn('px-4 py-2', isLarge && 'px-6 py-3', className)
// If className = 'px-8', output: 'py-3 px-8'  (twMerge resolves conflict)
```

---

## Checklist Before Submitting a Component

- [ ] No wrapper `<div>` unless structurally necessary
- [ ] Props destructured in signature
- [ ] `cn()` for all className composition
- [ ] No derived state in `useState` or `useEffect`
- [ ] Explicit types only where inference fails
- [ ] No `any` types
- [ ] Dynamic import on components >10KB not in critical path
- [ ] No TODO comments without a ticket reference
- [ ] Line count within budget for component size
- [ ] No `useEffect` that could be replaced with event handler or derived value

---

## Token Optimization for LLM UI Generation

### Context-window discipline
Agent context is finite: **every token the skill spends is a token stolen from the user's prompt and the generated code.** A skill that loads 40k of reference to write a button has failed regardless of how good the reference is.

### Rules for skill authors
- One rule per line. No prose paragraphs where a table works.
- Examples ≤10 lines inline; anything longer moves to a reference or an example file.
- Never duplicate a rule across files — cross-reference instead. Duplication doubles the cost and guarantees eventual drift.
- Tables compress better than nested lists.
- Frontmatter carries `name`, `description`, `version`, `core-deps` only. No metadata bloat.
- Skill files are routers: own rules plus a reference index. Depth loads on demand.

### Rules for agent output
- Generated components ≤150 lines. Past that, split — for the reader's benefit as much as the budget's.
- Prop interfaces extend base element types rather than redeclaring them.
- Composition over configuration: fewer props, smaller surface, less to describe.
- Prefer CSS over JS where both work — fewer tokens to emit and better runtime performance.
- Emit the code, not a narration of the code. The diff is the explanation.
