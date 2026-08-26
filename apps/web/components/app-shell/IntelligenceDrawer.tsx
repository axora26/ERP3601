"use client";

import { useState } from "react";

export function IntelligenceDrawer({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="axora-drawer-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="axora-intelligence-drawer"
      >
        {open ? "Close panel" : "Session"}
      </button>
      {open && (
        <aside id="axora-intelligence-drawer" aria-label="Intelligence drawer" className="axora-drawer">
          {children}
        </aside>
      )}
    </>
  );
}
