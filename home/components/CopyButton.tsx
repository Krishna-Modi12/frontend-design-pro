"use client";

import { useState } from "react";
import type { ReactElement } from "react";
import { focusRing, tapTarget } from "../lib/tokens";

export interface CopyButtonProps {
  text: string;
}

export function CopyButton({ text }: CopyButtonProps): ReactElement {
  const [copied, setCopied] = useState(false);

  const onClick = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard access denied or unavailable — the command is still
      // selectable text, so nothing is actually lost.
    }
  };

  return (
    <button
      type="button"
      onClick={() => void onClick()}
      className={`${tapTarget} ${focusRing} shrink-0 rounded-lg border border-white/20 px-4 text-sm font-medium text-ink-invert transition-colors duration-150 ease-out hover:border-accent motion-reduce:transition-none`}
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

export default CopyButton;
