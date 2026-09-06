<!-- shortcode: [e2e] | ~3.5k tokens -->

# Playwright — E2E & Component Testing

End-to-end and component testing with Playwright: setup, core API, visual regression, accessibility, network mocking, fixtures, CI, and patterns for common UI components.

---

## Contents

- [1. Setup](#1-setup)
- [2. Core API](#2-core-api)
- [3. Visual Regression](#3-visual-regression)
- [4. Accessibility Testing](#4-accessibility-testing)
- [5. Network Mocking](#5-network-mocking)
- [6. Fixtures & Hooks](#6-fixtures--hooks)
- [7. CI Configuration](#7-ci-configuration)
- [8. Patterns for Common Components](#8-patterns-for-common-components)
- [9. Anti-Patterns](#9-anti-patterns)
- [Quick Reference](#quick-reference)

---

## 1. Setup

### Install `@playwright/experimental-ct-react`

```ts
// Install packages
// npm install -D @playwright/experimental-ct-react @playwright/test
// npx playwright install chromium
```

### `playwright.config.ts` for Component Tests

```ts
// playwright.config.ts
import { defineConfig, devices } from "@playwright/experimental-ct-react"

export default defineConfig({
  testDir: "./src",                      // co-located with components
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : 4,

  use: {
    ctPort: 3100,                        // component test dev server port
    ctViteConfig: {
      resolve: {
        alias: { "@": "/src" },
      },
    },
    trace: "on-first-retry",             // capture trace on first retry
    screenshot: "only-on-failure",
  },

  // For page-level e2e tests: spin up the dev server
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },

  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox",  use: { ...devices["Desktop Firefox"] } },
    { name: "webkit",   use: { ...devices["Desktop Safari"] } },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
    },
  ],

  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
  ],
})
```

### File Naming and Co-location

```
src/
  components/
    Dialog/
      Dialog.tsx
      Dialog.spec.ts        ← co-located spec
    DataTable/
      DataTable.tsx
      DataTable.spec.ts
  pages/
    checkout/
      CheckoutPage.tsx
      CheckoutPage.spec.ts
```

---

## 2. Core API

### `test()` and `expect()` Imports

```ts
import { test, expect } from "@playwright/test"
// For component tests:
import { test, expect } from "@playwright/experimental-ct-react"
import { MyComponent } from "./MyComponent"
```

### Role-Based Selectors (Preferred)

```ts
test("submits the form", async ({ page }) => {
  await page.goto("/signup")

  // Role + accessible name — survives CSS refactors
  await page.getByRole("button", { name: "Submit" }).click()

  // Label-associated input
  await page.getByLabel("Email address").fill("user@example.com")

  // Exact visible text match
  await page.getByText("Success! Account created.").waitFor()

  // data-testid attribute — use only when no semantic role exists
  await page.getByTestId("avatar-upload").setInputFiles("./fixtures/photo.jpg")
})
```

### Locator Actions

```ts
test("interactive actions", async ({ page }) => {
  const input = page.getByLabel("Search")
  const button = page.getByRole("button", { name: "Search" })
  const menu = page.getByRole("menu")

  await input.fill("react testing")          // clear + type
  await input.press("Enter")                 // keyboard key
  await button.hover()                       // trigger tooltip
  await button.focus()                       // programmatic focus
  await button.click()                       // pointer click

  // Chained locators
  const dialog = page.getByRole("dialog")
  await dialog.getByRole("button", { name: "Confirm" }).click()
})
```

### `expect()` Assertions

```ts
const button = page.getByRole("button", { name: "Save" })
const input = page.getByLabel("Username")

await expect(button).toBeVisible()
await expect(button).toBeDisabled()
await expect(button).toHaveClass(/btn-primary/)

await expect(input).toHaveValue("alice")
await expect(input).toBeFocused()

await expect(page.getByRole("alert")).toHaveText("Username already taken")

// Wait up to timeout (default 5 s) — no manual waits needed
await expect(page.getByText("Saved")).toBeVisible()
```

---

## 3. Visual Regression

### Screenshot Assertions

```ts
test("button renders correctly", async ({ page }) => {
  await page.goto("/components/button")

  // Full-page snapshot
  await expect(page).toHaveScreenshot("button-default.png", {
    maxDiffPixels: 50,      // tolerate minor font-rendering variance
  })

  // Element-scoped snapshot
  const card = page.getByTestId("pricing-card")
  await expect(card).toHaveScreenshot("pricing-card.png", {
    maxDiffPixels: 30,
  })
})
```

### Updating Snapshots

```bash
# Re-generate all baseline screenshots
npx playwright test --update-snapshots

# Re-generate for a single spec
npx playwright test src/components/Button/Button.spec.ts --update-snapshots
```

### Per-Viewport Snapshots

```ts
test("responsive layout", async ({ page }) => {
  await page.goto("/dashboard")

  await page.setViewportSize({ width: 1440, height: 900 })
  await expect(page).toHaveScreenshot("dashboard-desktop.png", { maxDiffPixels: 50 })

  await page.setViewportSize({ width: 375, height: 812 })
  await expect(page).toHaveScreenshot("dashboard-mobile.png", { maxDiffPixels: 50 })
})
```

---

## 4. Accessibility Testing

### `@axe-core/playwright` Integration

```ts
import { test, expect } from "@playwright/test"
import { checkA11y, injectAxe } from "axe-playwright"

test("page passes WCAG 2.1 AA", async ({ page }) => {
  await page.goto("/checkout")
  await injectAxe(page)

  await checkA11y(page, "#root", {
    runOnly: ["wcag2a", "wcag2aa"],
    // Suppress known acceptable violations
    axeOptions: {
      rules: {
        "color-contrast": { enabled: true },
      },
    },
  })
})
```

### Focus Order Assertions

```ts
test("tab order follows visual order", async ({ page }) => {
  await page.goto("/login")

  // Start at top of page
  await page.keyboard.press("Tab")
  await expect(page.getByLabel("Email")).toBeFocused()

  await page.keyboard.press("Tab")
  await expect(page.getByLabel("Password")).toBeFocused()

  await page.keyboard.press("Tab")
  await expect(page.getByRole("button", { name: "Sign in" })).toBeFocused()
})
```

### `aria-live` Region Assertions

```ts
test("status message announced on save", async ({ page }) => {
  await page.goto("/settings")

  await page.getByLabel("Display name").fill("Alice")
  await page.getByRole("button", { name: "Save" }).click()

  // Assert the live region text — screen reader will announce this
  const liveRegion = page.locator("[aria-live]")
  await expect(liveRegion).toHaveText("Changes saved successfully.")
})
```

---

## 5. Network Mocking

### Fulfill with Mock Data

```ts
test("renders posts from API", async ({ page }) => {
  const mockData = [
    { id: 1, title: "Hello World", author: "Alice" },
    { id: 2, title: "Second Post", author: "Bob" },
  ]

  await page.route("**/api/posts", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      json: mockData,
    })
  )

  await page.goto("/blog")
  await expect(page.getByRole("article")).toHaveCount(2)
  await expect(page.getByText("Hello World")).toBeVisible()
})
```

### Simulating Error States

```ts
test("shows error banner on API failure", async ({ page }) => {
  await page.route("**/api/posts", (route) =>
    route.fulfill({
      status: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    })
  )

  await page.goto("/blog")
  await expect(page.getByRole("alert")).toHaveText(/failed to load/i)
  await expect(page.getByRole("button", { name: "Retry" })).toBeVisible()
})
```

### Removing a Route

```ts
test("removes mock after first call", async ({ page }) => {
  let callCount = 0

  const handler = (route: Route) => {
    callCount++
    route.continue()
  }

  await page.route("**/api/user", handler)
  await page.goto("/profile")

  // Remove mock — subsequent requests hit the real server
  await page.unroute("**/api/user", handler)

  await page.reload()
  expect(callCount).toBe(1)
})
```

---

## 6. Fixtures & Hooks

### Authenticated State with `storageState`

```ts
// auth.setup.ts — run once to produce auth.json
import { test as setup } from "@playwright/test"

setup("authenticate", async ({ page }) => {
  await page.goto("/login")
  await page.getByLabel("Email").fill("test@example.com")
  await page.getByLabel("Password").fill("password123")
  await page.getByRole("button", { name: "Sign in" }).click()
  await page.waitForURL("/dashboard")
  await page.context().storageState({ path: "playwright/.auth/auth.json" })
})
```

```ts
// playwright.config.ts — reference auth.json
export default defineConfig({
  projects: [
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    {
      name: "authenticated",
      use: { storageState: "playwright/.auth/auth.json" },
      dependencies: ["setup"],
    },
  ],
})

// In any spec — inherit saved auth state automatically
test.use({ storageState: "playwright/.auth/auth.json" })
```

### `beforeEach` / `afterAll` Hooks

```ts
test.describe("Settings page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/settings")
    await page.getByRole("tab", { name: "Profile" }).click()
  })

  test.afterAll(async () => {
    // Cleanup: e.g., reset DB via API call
    await fetch("http://localhost:3000/api/test/reset", { method: "POST" })
  })

  test("updates display name", async ({ page }) => {
    await page.getByLabel("Display name").fill("New Name")
    await page.getByRole("button", { name: "Save" }).click()
    await expect(page.getByText("Changes saved")).toBeVisible()
  })
})
```

### Custom Fixtures

```ts
// fixtures.ts
import { test as base, type Page } from "@playwright/test"

type Fixtures = {
  loggedInPage: Page
  adminPage: Page
}

export const test = base.extend<Fixtures>({
  loggedInPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: "playwright/.auth/auth.json",
    })
    const page = await context.newPage()
    await use(page)
    await context.close()
  },

  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: "playwright/.auth/admin.json",
    })
    const page = await context.newPage()
    await page.goto("/admin")
    await use(page)
    await context.close()
  },
})

export { expect } from "@playwright/test"
```

```ts
// usage in spec
import { test, expect } from "./fixtures"

test("admin can delete users", async ({ adminPage }) => {
  await adminPage.getByRole("button", { name: "Delete user" }).first().click()
  await expect(adminPage.getByText("User deleted")).toBeVisible()
})
```

---

## 7. CI Configuration

### GitHub Actions

```yaml
# .github/workflows/playwright.yml
name: Playwright Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run Playwright tests
        run: npx playwright test
          --reporter=github
          --reporter=html
        env:
          CI: true

      - name: Upload HTML report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

      - name: Upload trace on failure
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-traces
          path: test-results/
```

### Key CI Settings

```ts
// playwright.config.ts — CI-aware config
export default defineConfig({
  workers: process.env.CI ? 2 : 4,     // fewer workers on CI to avoid resource contention
  retries: process.env.CI ? 2 : 0,     // retry flaky tests on CI only
  use: {
    trace: "on-first-retry",           // trace viewer: capture on first retry
    video: "retain-on-failure",        // record video on failure
    screenshot: "only-on-failure",
  },
})
```

---

## 8. Patterns for Common Components

### Dialog: Focus Trap + Return Focus

```ts
test("dialog traps focus and returns it on close", async ({ page }) => {
  await page.goto("/modal-demo")

  const trigger = page.getByRole("button", { name: "Open dialog" })
  await trigger.click()

  const dialog = page.getByRole("dialog")
  await expect(dialog).toBeVisible()

  // First focusable element inside dialog should receive focus
  const closeBtn = dialog.getByRole("button", { name: "Close" })
  await expect(closeBtn).toBeFocused()

  // Tab should stay within the dialog (focus trap)
  await page.keyboard.press("Tab")
  await expect(dialog.getByRole("button", { name: "Confirm" })).toBeFocused()

  // Close dialog — focus must return to trigger
  await page.keyboard.press("Escape")
  await expect(dialog).not.toBeVisible()
  await expect(trigger).toBeFocused()
})
```

### Form: Validation Error → Fix → Success

```ts
test("shows validation errors then succeeds on valid input", async ({ page }) => {
  await page.goto("/signup")

  // Submit empty form
  await page.getByRole("button", { name: "Create account" }).click()

  // Assert validation errors appear
  await expect(page.getByText("Email is required")).toBeVisible()
  await expect(page.getByText("Password must be at least 8 characters")).toBeVisible()

  // Fix errors
  await page.getByLabel("Email").fill("valid@example.com")
  await page.getByLabel("Password").fill("securepassword")

  // Errors clear as fields are fixed
  await expect(page.getByText("Email is required")).not.toBeVisible()

  // Submit valid form
  await page.getByRole("button", { name: "Create account" }).click()

  // Assert success state
  await expect(page.getByText("Account created! Check your email.")).toBeVisible()
  await expect(page).toHaveURL(/\/verify-email/)
})
```

### Data Table: Sort Header + `aria-sort`

```ts
test("sorts table by column and updates aria-sort", async ({ page }) => {
  await page.goto("/users")

  const nameHeader = page.getByRole("columnheader", { name: "Name" })

  // Initial state — no sort applied
  await expect(nameHeader).toHaveAttribute("aria-sort", "none")

  // First click — ascending
  await nameHeader.click()
  await expect(nameHeader).toHaveAttribute("aria-sort", "ascending")

  const rows = page.getByRole("row").filter({ hasNot: page.getByRole("columnheader") })
  const firstRowName = await rows.first().getByRole("cell").first().textContent()
  const lastRowName = await rows.last().getByRole("cell").first().textContent()
  expect(firstRowName!.localeCompare(lastRowName!)).toBeLessThanOrEqual(0)

  // Second click — descending
  await nameHeader.click()
  await expect(nameHeader).toHaveAttribute("aria-sort", "descending")
})
```

### Infinite Scroll: Load More + Spinner Hidden

```ts
test("loads more items on scroll and hides spinner", async ({ page }) => {
  await page.route("**/api/posts?page=1", (route) =>
    route.fulfill({ json: { items: Array(20).fill({ id: 1, title: "Post" }), hasMore: true } })
  )
  await page.route("**/api/posts?page=2", (route) =>
    route.fulfill({ json: { items: Array(10).fill({ id: 21, title: "More" }), hasMore: false } })
  )

  await page.goto("/feed")
  await expect(page.getByRole("article")).toHaveCount(20)

  // Scroll to bottom
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

  // Spinner appears then disappears
  const spinner = page.getByRole("status", { name: "Loading more posts" })
  await expect(spinner).toBeVisible()
  await expect(spinner).not.toBeVisible()

  // New items loaded
  await expect(page.getByRole("article")).toHaveCount(30)
})
```

---

## 9. Anti-Patterns

### CSS Selector Queries Instead of Roles

```ts
// BAD — breaks on class rename; conveys no semantic intent
await page.locator(".btn-primary").click()
await page.locator("#submit-btn").click()
await page.locator("div.card > p.error-msg").waitFor()

// GOOD — role-based; resilient and self-documenting
await page.getByRole("button", { name: "Submit" }).click()
await expect(page.getByRole("alert")).toBeVisible()
```

### No Accessibility Assertions

```ts
// BAD — tests interaction but ignores a11y
test("form submits", async ({ page }) => {
  await page.goto("/contact")
  await page.locator("input").first().fill("hello")
  await page.locator("button").click()
  await expect(page.locator(".success")).toBeVisible()
})

// GOOD — include axe check alongside functional assertions
test("form submits and is accessible", async ({ page }) => {
  await page.goto("/contact")
  await injectAxe(page)
  await checkA11y(page, "form", { runOnly: ["wcag2a", "wcag2aa"] })
  await page.getByLabel("Message").fill("hello")
  await page.getByRole("button", { name: "Send" }).click()
  await expect(page.getByRole("alert")).toHaveText(/message sent/i)
})
```

### Hardcoded Waits

```ts
// BAD — arbitrary sleep; slow on fast machines, flaky on slow ones
await page.click("button")
await page.waitForTimeout(2000)
await expect(page.locator(".result")).toBeVisible()

// GOOD — wait for the actual condition; Playwright retries automatically
await page.getByRole("button", { name: "Load results" }).click()
await expect(page.getByRole("listitem")).toHaveCount(10)
```

### Missing Error State Tests

```ts
// BAD — only tests happy path
test("loads user profile", async ({ page }) => {
  await page.goto("/profile/alice")
  await expect(page.getByRole("heading", { name: "Alice" })).toBeVisible()
})

// GOOD — also test the failure path
test("shows error when profile fails to load", async ({ page }) => {
  await page.route("**/api/users/alice", (route) =>
    route.fulfill({ status: 404, json: { message: "Not found" } })
  )
  await page.goto("/profile/alice")
  await expect(page.getByRole("alert")).toHaveText(/profile not found/i)
  await expect(page.getByRole("link", { name: "Go back" })).toBeVisible()
})
```

### Screenshot Tests Without `maxDiffPixels`

```ts
// BAD — fails on sub-pixel font-rendering differences across OS/CI
await expect(page).toHaveScreenshot("dashboard.png")

// GOOD — tolerate minor rendering variance; set a budget, not unlimited
await expect(page).toHaveScreenshot("dashboard.png", {
  maxDiffPixels: 50,
  // Or use a ratio for larger pages:
  // maxDiffPixelRatio: 0.02,
})
```

---

## Quick Reference

| Task | API |
|---|---|
| Navigate | `page.goto(url)` |
| Role selector | `page.getByRole('button', { name: '…' })` |
| Label selector | `page.getByLabel('Email')` |
| Text selector | `page.getByText('Submit')` |
| Test ID | `page.getByTestId('upload')` |
| Click | `locator.click()` |
| Type | `locator.fill('value')` |
| Keyboard | `locator.press('Enter')` / `page.keyboard.press('Tab')` |
| Visible? | `expect(locator).toBeVisible()` |
| Text match | `expect(locator).toHaveText('…')` |
| Value match | `expect(locator).toHaveValue('…')` |
| Disabled? | `expect(locator).toBeDisabled()` |
| Class match | `expect(locator).toHaveClass(/regex/)` |
| Screenshot | `expect(page).toHaveScreenshot('name.png', { maxDiffPixels: 50 })` |
| A11y check | `checkA11y(page, '#root', { runOnly: ['wcag2a', 'wcag2aa'] })` |
| Mock network | `page.route('**/api/**', route => route.fulfill({ json: data }))` |
| Remove mock | `page.unroute('**/api/**', handler)` |
| Auth state | `test.use({ storageState: 'playwright/.auth/auth.json' })` |
| Update snapshots | `npx playwright test --update-snapshots` |
