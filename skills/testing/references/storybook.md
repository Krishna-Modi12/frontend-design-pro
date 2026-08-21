<!-- shortcode: [stories] | package: frontend-design-pro-v10 | version: 10.15.0 -->

# Storybook Reference

Source: frontend-design-pro skill (internal)
Version: 10.15.0

Storybook 8 is the standard tool for developing, documenting, and visually testing UI components in isolation. This reference covers typed story authoring with CSF3, interaction testing via `play` functions, MDX docs, visual regression with Chromatic, and accessibility testing.

---

## Contents

- [1. Setup — Storybook 8 with Next.js or Vite](#1-setup--storybook-8-with-nextjs-or-vite)
- [2. Typed Story Authoring — CSF3](#2-typed-story-authoring--csf3)
- [3. args + argTypes Controls](#3-args--argtypes-controls)
- [4. Parameters](#4-parameters)
- [5. Decorators — Wrapping with Providers](#5-decorators--wrapping-with-providers)
- [6. play Functions — Interaction Testing](#6-play-functions--interaction-testing)
- [7. MDX Documentation](#7-mdx-documentation)
- [8. autodocs Tag](#8-autodocs-tag)
- [9. Viewport Addon + a11y Addon](#9-viewport-addon--a11y-addon)
- [10. Chromatic Visual Regression](#10-chromatic-visual-regression)
- [11. Worked Examples](#11-worked-examples)
- [12. composeStories — Unit Test Integration](#12-composestories--unit-test-integration)
- [13. Anti-Patterns](#13-anti-patterns)

---

## 1. Setup — Storybook 8 with Next.js or Vite

**Next.js:**

```bash
npx storybook@latest init
# Detects Next.js automatically — installs @storybook/nextjs
```

**Vite (React):**

```bash
npx storybook@latest init
# Detects Vite — installs @storybook/react-vite
```

**.storybook/main.ts:**

```ts
import type { StorybookConfig } from "@storybook/nextjs"; // or "@storybook/react-vite"

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx|mdx)"],
  addons: [
    "@storybook/addon-essentials",   // controls, actions, backgrounds, viewport, docs
    "@storybook/addon-a11y",         // axe-core accessibility checks
    "@storybook/addon-interactions", // play function timeline
  ],
  framework: {
    name: "@storybook/nextjs",       // or "@storybook/react-vite"
    options: {},
  },
};

export default config;
```

---

## 2. Typed Story Authoring — CSF3

The Component Story Format 3 (CSF3) uses `Meta<typeof Component>` for metadata and `StoryObj<typeof meta>` for individual stories. This gives full TypeScript inference on `args` and `argTypes`.

```tsx
// src/components/Button/Button.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

// --- Meta ---
const meta = {
  title: "Components/Button",
  component: Button,
  // autodocs generates a documentation page from JSDoc + arg types
  tags: ["autodocs"],
  parameters: {
    layout: "centered", // "centered" | "fullscreen" | "padded"
  },
  // argTypes define controls for each prop in the Storybook UI
  argTypes: {
    label: {
      control: "text",
      description: "Button label text",
    },
    variant: {
      control: "select",
      options: ["primary", "secondary", "destructive", "ghost"],
      description: "Visual variant",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    disabled: {
      control: "boolean",
    },
    backgroundColor: {
      control: "color",
      description: "Override background color",
    },
    opacity: {
      control: { type: "range", min: 0, max: 1, step: 0.1 },
    },
    onClick: {
      action: "clicked",  // logs to the Actions panel
    },
  },
  // Default args — applied to every story unless overridden
  args: {
    label: "Button",
    variant: "primary",
    size: "md",
    disabled: false,
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// --- Stories ---
export const Default: Story = {};

export const Secondary: Story = {
  args: { variant: "secondary" },
};

export const Destructive: Story = {
  args: {
    variant: "destructive",
    label: "Delete account",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    label: "Unavailable",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
    label: "Get started",
  },
};
```

---

## 3. args + argTypes Controls

All control types available in Storybook 8:

```ts
argTypes: {
  // Text input
  title: { control: "text" },

  // Multiline text area
  description: { control: "object" },

  // True/false toggle
  isLoading: { control: "boolean" },

  // Dropdown from fixed options
  status: {
    control: "select",
    options: ["idle", "loading", "success", "error"],
  },

  // Multi-select checkboxes
  tags: {
    control: "multi-select",
    options: ["featured", "new", "sale", "limited"],
  },

  // Radio buttons
  align: {
    control: "radio",
    options: ["left", "center", "right"],
  },

  // Color picker
  accentColor: { control: "color" },

  // Number slider
  columns: {
    control: { type: "range", min: 1, max: 6, step: 1 },
  },

  // Plain number input
  maxItems: { control: "number" },

  // Date picker
  publishedAt: { control: "date" },

  // Hide a prop from the controls panel
  ref: { table: { disable: true } },
  children: { table: { disable: true } },

  // Add JSDoc description and default value to the docs table
  variant: {
    control: "select",
    options: ["default", "outline"],
    description: "Visual style variant",
    table: {
      defaultValue: { summary: "default" },
      type: { summary: "string" },
    },
  },
}
```

---

## 4. Parameters

```tsx
// Story-level parameters override global/meta parameters
export const FullWidth: Story = {
  parameters: {
    layout: "fullscreen",
    // Custom backgrounds for this story
    backgrounds: {
      default: "dark",
      values: [
        { name: "light", value: "#ffffff" },
        { name: "dark", value: "#09090b" },
        { name: "brand", value: "#1e40af" },
      ],
    },
    // Viewport addon — simulate device sizes
    viewport: {
      defaultViewport: "iphone14",
    },
    // Chromatic — disable snapshot for a specific story
    chromatic: { disableSnapshot: true },
  },
};

// .storybook/preview.ts — global parameters
import type { Preview } from "@storybook/react";

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: "#ffffff" },
        { name: "dark", value: "#09090b" },
      ],
    },
    viewport: {
      viewports: {
        mobile: { name: "Mobile", styles: { width: "390px", height: "844px" } },
        tablet: { name: "Tablet", styles: { width: "768px", height: "1024px" } },
        desktop: { name: "Desktop", styles: { width: "1440px", height: "900px" } },
      },
    },
    layout: "centered",
  },
};

export default preview;
```

---

## 5. Decorators — Wrapping with Providers

Decorators wrap every story in a given scope with context providers, routers, or layout containers.

```tsx
// .storybook/preview.ts — global decorators (applied to all stories)
import type { Preview } from "@storybook/react";
import { ThemeProvider } from "../src/components/ThemeProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, staleTime: Infinity } },
});

const preview: Preview = {
  decorators: [
    // Wrap all stories with theme + query context
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <Story />
        </ThemeProvider>
      </QueryClientProvider>
    ),
  ],
};

export default preview;
```

**Story-level decorator — wrap one specific story:**

```tsx
import { MemoryRouter } from "react-router-dom"; // or next/navigation mock

export const WithRouter: Story = {
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Story />
      </MemoryRouter>
    ),
  ],
};
```

**Next.js router mock — `@storybook/nextjs` handles this automatically for `useRouter`, `usePathname`, etc.:**

```tsx
export const ActiveNavItem: Story = {
  parameters: {
    nextjs: {
      router: {
        pathname: "/dashboard",
        query: { tab: "overview" },
      },
    },
  },
};
```

---

## 6. play Functions — Interaction Testing

`play` functions simulate user interactions after a story renders. They run in the browser (real DOM) and are visible in the Interactions panel.

```tsx
import { within, userEvent, expect } from "@storybook/test";
import type { Meta, StoryObj } from "@storybook/react";
import { LoginForm } from "./LoginForm";

const meta = {
  title: "Forms/LoginForm",
  component: LoginForm,
  tags: ["autodocs"],
} satisfies Meta<typeof LoginForm>;

export default meta;
type Story = StoryObj<typeof meta>;

// Filled and submitted successfully
export const ValidSubmission: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Type into fields
    await userEvent.type(canvas.getByLabelText("Email"), "user@example.com", {
      delay: 30,
    });
    await userEvent.type(canvas.getByLabelText("Password"), "securepassword123", {
      delay: 30,
    });

    // Submit the form
    await userEvent.click(canvas.getByRole("button", { name: /sign in/i }));

    // Assert loading state appears
    await expect(canvas.getByRole("status")).toBeInTheDocument();
  },
};

// Validation errors appear on empty submit
export const ValidationErrors: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Submit without filling in any fields
    await userEvent.click(canvas.getByRole("button", { name: /sign in/i }));

    // Both error messages should be visible
    await expect(
      canvas.getByText("Email is required")
    ).toBeVisible();
    await expect(
      canvas.getByText("Password must be at least 8 characters")
    ).toBeVisible();
  },
};

// Focus management — Tab key navigation
export const KeyboardNavigation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Focus first field
    await userEvent.tab();
    await expect(canvas.getByLabelText("Email")).toHaveFocus();

    // Tab to next field
    await userEvent.tab();
    await expect(canvas.getByLabelText("Password")).toHaveFocus();

    // Tab to submit button
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: /sign in/i })).toHaveFocus();
  },
};
```

**Available `@storybook/test` utilities:**

```ts
import {
  within,          // scope queries to a container
  userEvent,       // .click(), .type(), .hover(), .tab(), .keyboard()
  expect,          // Jest-compatible matchers
  waitFor,         // async polling for assertions
  fn,              // spy / mock function (replaces jest.fn())
} from "@storybook/test";
```

---

## 7. MDX Documentation

MDX files combine Markdown prose with live story embeds, providing rich component documentation pages.

```mdx
{/* src/components/Button/Button.mdx */}
import { Canvas, Controls, ArgTypes, Description, Meta } from "@storybook/blocks";
import * as ButtonStories from "./Button.stories";

<Meta of={ButtonStories} />

# Button

<Description of={ButtonStories} />

Buttons trigger actions or navigate. Use `primary` for the main call to action per
page, `secondary` for supporting actions, and `destructive` for irreversible operations.

## Playground

<Canvas of={ButtonStories.Default} />

### Controls

Adjust the controls below to see live variations:

<Controls of={ButtonStories.Default} />

## All Variants

<Canvas of={ButtonStories.Primary} />
<Canvas of={ButtonStories.Secondary} />
<Canvas of={ButtonStories.Destructive} />
<Canvas of={ButtonStories.Disabled} />

## Props Reference

<ArgTypes of={ButtonStories} />
```

**Connect MDX to a story file in `main.ts`:**

```ts
// main.ts — MDX files must match the stories glob
stories: ["../src/**/*.stories.@(ts|tsx)", "../src/**/*.mdx"],
```

**Disable `autodocs` when using a custom MDX doc page:**

```tsx
const meta = {
  title: "Components/Button",
  component: Button,
  // Remove "autodocs" tag — your MDX file handles documentation instead
  // tags: ["autodocs"],
} satisfies Meta<typeof Button>;
```

---

## 8. autodocs Tag

Adding `tags: ["autodocs"]` to `meta` generates a documentation page automatically from:

- Component JSDoc comments
- `argTypes` descriptions and default values
- All exported stories

```tsx
const meta = {
  title: "Components/Card",
  component: Card,
  tags: ["autodocs"], // generates "Docs" tab automatically
  argTypes: {
    title: {
      description: "Primary heading displayed in the card header",
      control: "text",
    },
    isLoading: {
      description: "Shows skeleton placeholder when true",
      control: "boolean",
      table: { defaultValue: { summary: "false" } },
    },
  },
} satisfies Meta<typeof Card>;
```

---

## 9. Viewport Addon + a11y Addon

**Viewport — simulate device screen sizes:**

```tsx
// Story-level viewport
export const MobileView: Story = {
  parameters: {
    viewport: { defaultViewport: "iphone14" },
    layout: "fullscreen",
  },
};

// Global viewport toolbar provides: iphone14, ipad, samsung-s10, macbook-13, etc.
// Define custom viewports in .storybook/preview.ts (see Section 4)
```

**a11y addon (`@storybook/addon-a11y`) — axe-core in the browser:**

The a11y addon runs axe-core against every rendered story and reports violations in the Accessibility panel.

```ts
// .storybook/preview.ts — global a11y config
import type { Preview } from "@storybook/react";

const preview: Preview = {
  parameters: {
    a11y: {
      // Configure which axe rules run
      config: {
        rules: [
          {
            // Disable a specific rule if it's a known false positive
            id: "color-contrast",
            enabled: false,
          },
        ],
      },
      // "manual" — disable automatic axe check, run manually per story
      manual: false,
    },
  },
};
```

```tsx
// Story-level a11y — skip or configure per story
export const HighContrast: Story = {
  parameters: {
    a11y: {
      config: {
        rules: [{ id: "color-contrast", enabled: true }],
      },
    },
  },
};

// Disable a11y check for a specific story (e.g., intentionally incomplete state)
export const SkeletonLoader: Story = {
  parameters: {
    a11y: { disable: true },
  },
};
```

---

## 10. Chromatic Visual Regression

Chromatic captures pixel-perfect screenshots of every story and flags unintended UI changes in CI.

```bash
npm install --save-dev chromatic
npx chromatic --project-token=<your-token>
```

**CI setup (GitHub Actions):**

```yaml
# .github/workflows/chromatic.yml
name: Chromatic
on: [push]
jobs:
  chromatic:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - run: npm ci
      - uses: chromaui/action@latest
        with:
          projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
          onlyChanged: true   # Turbosnap — only snapshot changed stories
```

**Story-level snapshot control:**

```tsx
// Disable snapshot for an animation-heavy or flaky story
export const AnimatedEntrance: Story = {
  parameters: {
    chromatic: { disableSnapshot: true },
  },
};

// Force a snapshot with specific viewport + theme combination
export const DarkDesktop: Story = {
  parameters: {
    chromatic: {
      modes: {
        "dark desktop": {
          colorScheme: "dark",
          viewport: { width: 1440 },
        },
        "light mobile": {
          colorScheme: "light",
          viewport: { width: 390 },
        },
      },
    },
  },
};

// Delay snapshot to wait for animations to finish
export const AnimatedChart: Story = {
  parameters: {
    chromatic: { delay: 500 }, // ms to wait before screenshotting
  },
};
```

---

## 11. Worked Examples

### Button Component Stories

```tsx
// src/components/Button/Button.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { within, userEvent, expect, fn } from "@storybook/test";
import { Button } from "./Button";

const meta = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: {
    onClick: fn(), // spy — visible in the Actions panel
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "destructive", "ghost"],
    },
    size: { control: "select", options: ["sm", "md", "lg"] },
    disabled: { control: "boolean" },
    isLoading: { control: "boolean" },
    label: { control: "text" },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: "Get started", variant: "primary" },
};

export const Hover: Story = {
  args: { label: "Hover me", variant: "primary" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole("button", { name: /hover me/i });
    await userEvent.hover(btn);
    // Hover state is visual — Chromatic captures it
  },
};

export const Disabled: Story = {
  args: { label: "Unavailable", variant: "primary", disabled: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole("button", { name: /unavailable/i });

    // Clicking a disabled button should not call onClick
    await userEvent.click(btn);
    await expect(args.onClick).not.toHaveBeenCalled();

    // Disabled button must have correct aria attribute
    await expect(btn).toBeDisabled();
  },
};

export const Loading: Story = {
  args: { label: "Save", isLoading: true, variant: "primary" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Loading button should communicate state to screen readers
    await expect(
      canvas.getByRole("button", { name: /save/i })
    ).toHaveAttribute("aria-busy", "true");
  },
};
```

### Form with play Function Testing Validation

```tsx
// src/components/ContactForm/ContactForm.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { within, userEvent, expect, waitFor } from "@storybook/test";
import { ContactForm } from "./ContactForm";

const meta = {
  title: "Forms/ContactForm",
  component: ContactForm,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ContactForm>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default empty form
export const Empty: Story = {};

// Show validation on empty submit
export const ValidationErrors: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /send/i }));
    await expect(canvas.getByText("Name is required")).toBeVisible();
    await expect(canvas.getByText("Valid email required")).toBeVisible();
    await expect(canvas.getByText("Message must be at least 20 characters")).toBeVisible();
  },
};

// Prefilled — verifies happy path renders correctly
export const Prefilled: Story = {
  args: {
    defaultValues: {
      name: "Jane Smith",
      email: "jane@example.com",
      message: "I would love to learn more about your product.",
    },
  },
};

// Complete submission flow
export const SuccessfulSubmit: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.type(canvas.getByLabelText("Name"), "Jane Smith");
    await userEvent.type(canvas.getByLabelText("Email"), "jane@example.com");
    await userEvent.type(
      canvas.getByLabelText("Message"),
      "I would love to learn more about your product."
    );

    await userEvent.click(canvas.getByRole("button", { name: /send/i }));

    // Wait for async submit to complete
    await waitFor(
      () => expect(canvas.getByText("Message sent!")).toBeVisible(),
      { timeout: 3000 }
    );
  },
};
```

---

## 12. composeStories — Unit Test Integration

`composeStories` imports stories into Vitest or Jest, applying their args, decorators, and play functions. This lets you reuse story definitions in unit tests.

```tsx
// src/components/Button/Button.test.tsx
import { render, screen } from "@testing-library/react";
import { composeStories } from "@storybook/react";
import * as stories from "./Button.stories";

// Apply all meta defaults, args, and decorators to each story
const { Default, Disabled, Loading } = composeStories(stories);

describe("Button", () => {
  it("renders the default button label", () => {
    render(<Default />);
    expect(screen.getByRole("button", { name: /get started/i })).toBeInTheDocument();
  });

  it("is disabled in the Disabled story", () => {
    render(<Disabled />);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("runs the Disabled story play function", async () => {
    const { container } = render(<Disabled />);
    // Execute the play function from the story
    await Disabled.play?.({ canvasElement: container });
  });
});
```

**Vitest setup for `@storybook/test`:**

```ts
// vitest.setup.ts
import "@testing-library/jest-dom";

// vitest.config.ts
import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
  },
});
```

---

## 13. Anti-Patterns

**Stories with hardcoded data.** Stories should use `args` so the Controls panel can modify them. Hardcoded values make stories static and untestable.

```tsx
// WRONG — data baked into the component, not overridable
export const UserCard: Story = {
  render: () => (
    <Card name="Jane Smith" role="Engineer" avatar="/jane.jpg" />
  ),
};

// RIGHT — data flows through args
export const UserCard: Story = {
  args: {
    name: "Jane Smith",
    role: "Engineer",
    avatar: "/jane.jpg",
  },
};
```

**Missing controls for key props.** Every meaningful prop should have a control so developers can explore states without code changes.

```tsx
// WRONG — argTypes empty, no controls in the panel
const meta = {
  component: Badge,
} satisfies Meta<typeof Badge>;

// RIGHT — each prop wired to the appropriate control
const meta = {
  component: Badge,
  argTypes: {
    label: { control: "text" },
    variant: { control: "select", options: ["default", "success", "warning", "error"] },
    size: { control: "select", options: ["sm", "md"] },
  },
} satisfies Meta<typeof Badge>;
```

**No loading or error state stories.** Components should have stories for every state they can be in — not just the happy path.

```tsx
// WRONG — only the success state documented
export const Default: Story = { args: { status: "success" } };

// RIGHT — full state coverage
export const Loading: Story = { args: { status: "loading" } };
export const Error: Story = { args: { status: "error", errorMessage: "Failed to load" } };
export const Empty: Story = { args: { status: "success", items: [] } };
export const Default: Story = { args: { status: "success", items: mockItems } };
```

**Missing a11y decorator for components that need context.** If a component uses `role`, `aria-*`, or focus management, verify it with the a11y addon and include an accessible story.

```tsx
// WRONG — modal story that is never checked for focus trap or ARIA attributes
export const Open: Story = {
  args: { isOpen: true },
};

// RIGHT — include a11y parameters and a play function for keyboard nav
export const Open: Story = {
  args: { isOpen: true },
  parameters: {
    a11y: { config: { rules: [{ id: "dialog-name", enabled: true }] } },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dialog = canvas.getByRole("dialog");
    await expect(dialog).toHaveAttribute("aria-modal", "true");
    await expect(dialog).toHaveAccessibleName();
  },
};
```

**Skipping Chromatic snapshots for all stories without reason.** `disableSnapshot: true` should be used sparingly — for genuinely flaky animation stories only, not to avoid reviewing visual changes.

```tsx
// WRONG — disabling snapshots globally in preview.ts hides regressions
parameters: { chromatic: { disableSnapshot: true } }

// RIGHT — disable only for specific unstable stories
export const AnimatedEntrance: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
};
```

---

> Related: `/sessions/beautiful-cool-archimedes/frontend-design-pro-v10/references/playwright.md` — end-to-end test patterns that complement Storybook interaction tests.
