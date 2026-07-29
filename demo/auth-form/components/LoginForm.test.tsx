// Test for LoginForm — generated per the Testing Doctrine (skills/testing/SKILL.md).
// Compile-only in this repo (test libs are ambient-stubbed in demo/_stubs.d.ts);
// install deps to run:
//   npm i -D vitest @testing-library/react @testing-library/user-event jest-axe jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { LoginForm } from "./LoginForm";
import type { AuthOutcome, LoginValues } from "../lib/validation";

expect.extend(toHaveNoViolations);

function renderForm(outcome: AuthOutcome = { status: "success", email: "ana@arclight.io" }) {
  const onAuthenticate = vi.fn(async (_values: LoginValues): Promise<AuthOutcome> => outcome);
  const onAuthenticated = vi.fn();
  const onOAuthSelect = vi.fn(async (): Promise<void> => undefined);
  render(
    <LoginForm
      onAuthenticate={onAuthenticate}
      onAuthenticated={onAuthenticated}
      onOAuthSelect={onOAuthSelect}
    />,
  );
  return { onAuthenticate, onAuthenticated, onOAuthSelect };
}

describe("LoginForm", () => {
  it("labels every field so it is reachable by name", () => {
    renderForm();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/keep me signed in/i)).toBeInTheDocument();
  });

  it("submits the typed credentials", async () => {
    const user = userEvent.setup();
    const { onAuthenticate, onAuthenticated } = renderForm();

    await user.type(screen.getByLabelText(/email address/i), "ana@arclight.io");
    await user.type(screen.getByLabelText(/^password$/i), "correct-horse-battery");
    await user.click(screen.getByRole("button", { name: /^sign in$/i }));

    expect(onAuthenticate).toHaveBeenCalledWith(
      expect.objectContaining({ email: "ana@arclight.io", password: "correct-horse-battery" }),
    );
    expect(onAuthenticated).toHaveBeenCalledWith("ana@arclight.io");
  });

  it("rejects a malformed address without calling the server", async () => {
    const user = userEvent.setup();
    const { onAuthenticate } = renderForm();

    await user.type(screen.getByLabelText(/email address/i), "ana@arclight");
    await user.tab();

    expect(await screen.findByText(/valid email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toHaveAttribute("aria-invalid", "true");
    expect(onAuthenticate).not.toHaveBeenCalled();
  });

  it("announces a rejected credential pair without naming which field failed", async () => {
    const user = userEvent.setup();
    renderForm({ status: "rejected" });

    await user.type(screen.getByLabelText(/email address/i), "ana@arclight.io");
    await user.type(screen.getByLabelText(/^password$/i), "wrong-password");
    await user.click(screen.getByRole("button", { name: /^sign in$/i }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/don’t match an account/i);
  });

  it("names the wait when the account is rate limited", async () => {
    const user = userEvent.setup();
    renderForm({ status: "rate-limited", retryAfterSeconds: 300 });

    await user.type(screen.getByLabelText(/email address/i), "ana@arclight.io");
    await user.type(screen.getByLabelText(/^password$/i), "correct-horse-battery");
    await user.click(screen.getByRole("button", { name: /^sign in$/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/5 minutes/i);
  });

  it("toggles password visibility and says which state the control is in", async () => {
    const user = userEvent.setup();
    renderForm();

    const field = screen.getByLabelText(/^password$/i);
    expect(field).toHaveAttribute("type", "password");

    await user.click(screen.getByRole("button", { name: /show password/i }));
    expect(field).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: /hide password/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("has no axe accessibility violations", async () => {
    const { container } = render(
      <LoginForm
        onAuthenticate={async (): Promise<AuthOutcome> => ({ status: "rejected" })}
        onAuthenticated={() => undefined}
        onOAuthSelect={async (): Promise<void> => undefined}
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
