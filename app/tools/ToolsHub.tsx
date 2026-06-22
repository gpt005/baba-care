"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Logo } from "../_components/Logo";
import { Button } from "../_components/Button";

const INVOICE_URL = process.env.NEXT_PUBLIC_INVOICE_URL ?? "http://localhost:8000";
const STORAGE_KEY = "baba.invoice.password";

type Status = "booting" | "locked" | "checking" | "unlocked";

const fieldStyle =
  "w-full rounded-2xl border border-ink/15 bg-white px-4 py-2.5 font-body text-base text-ink " +
  "shadow-[inset_0_1px_2px_rgba(43,42,40,0.04)] " +
  "focus:outline-none focus:border-pink-deepest focus:ring-2 focus:ring-pink-deepest/20 " +
  "placeholder:text-ink/35";

const TOOLS = [
  {
    href: "/invoice",
    label: "Invoice Generator",
    description: "Create and download a branded PDF invoice for a client.",
    emoji: "🧾",
  },
  {
    href: "/visit-report",
    label: "Visit Report",
    description: "Fill out a daily visit summary and share a PDF with the pet owner.",
    emoji: "🐾",
  },
];

export function ToolsHub() {
  const [status, setStatus] = useState<Status>(() =>
    typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY)
      ? "booting"
      : "locked",
  );
  const [password, setPassword] = useState("");
  const [reveal, setReveal] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status !== "booting") return;
    const stored = localStorage.getItem(STORAGE_KEY)!;
    fetch(`${INVOICE_URL}/auth/check`, { headers: { "X-API-Key": stored } })
      .then((r) => {
        if (r.ok) setStatus("unlocked");
        else { localStorage.removeItem(STORAGE_KEY); setStatus("locked"); }
      })
      .catch(() => setStatus("locked"));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleUnlock(e: FormEvent) {
    e.preventDefault();
    setError("");
    setStatus("checking");
    try {
      const r = await fetch(`${INVOICE_URL}/auth/check`, {
        headers: { "X-API-Key": password },
      });
      if (r.ok) {
        if (remember) localStorage.setItem(STORAGE_KEY, password);
        setStatus("unlocked");
      } else {
        setError("Incorrect password.");
        setStatus("locked");
      }
    } catch {
      setError("Could not reach the server.");
      setStatus("locked");
    }
  }

  if (status === "booting" || status === "locked" || status === "checking") {
    const checking = status === "checking";
    return (
      <main className="min-h-screen bg-pink-soft/30 px-4 pt-8 pb-16">
        <div className="mx-auto w-full max-w-3xl space-y-6">
          <header className="flex items-center justify-between">
            <Logo size="sm" />
          </header>

          {status === "booting" ? (
            <div className="flex justify-center pt-16">
              <div className="h-8 w-8 rounded-full border-2 border-pink-deepest border-t-transparent animate-spin" />
            </div>
          ) : (
            <section className="w-full max-w-md rounded-3xl bg-cream border border-ink/10 shadow-[0_8px_28px_-16px_rgba(43,42,40,0.25)] p-6 md:p-8 mx-auto">
              <h1 className="font-display text-3xl text-pink-deepest text-center">internal tools</h1>
              <p className="mt-1 mb-6 text-center font-body text-sm text-ink/65">Enter the password to continue.</p>
              <form onSubmit={handleUnlock} className="space-y-4">
                <div>
                  <label htmlFor="hub-password" className="block font-rounded text-sm font-semibold text-ink/80 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="hub-password"
                      type={reveal ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`${fieldStyle} pr-16`}
                      disabled={checking}
                      autoFocus
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setReveal((r) => !r)}
                      disabled={checking}
                      aria-label={reveal ? "Hide password" : "Show password"}
                      aria-pressed={reveal}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 font-rounded text-xs font-semibold text-ink/60 hover:text-pink-deepest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-deepest/40 disabled:opacity-40"
                    >
                      {reveal ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
                <label className="flex items-center gap-2 font-body text-sm text-ink/75 select-none">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 rounded border-ink/30 accent-pink-deepest"
                    disabled={checking}
                  />
                  Stay signed in on this device
                </label>
                {error && (
                  <p role="alert" className="rounded-xl bg-pink-soft/40 border border-pink-deepest/30 px-3 py-2 text-sm text-pink-deepest">
                    {error}
                  </p>
                )}
                <Button type="submit" size="lg" className="w-full" disabled={checking}>
                  {checking ? "Checking…" : "Continue"}
                </Button>
              </form>
            </section>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-pink-soft/30 px-5 py-12">
      <div className="mx-auto w-full max-w-lg space-y-8">
        <header className="flex flex-col items-center gap-3">
          <Logo size="sm" />
          <p className="font-rounded text-sm font-semibold text-ink/70">Internal tools</p>
        </header>

        <ul className="space-y-4">
          {TOOLS.map((tool) => (
            <li key={tool.href}>
              <Link
                href={tool.href}
                className="group flex items-start gap-4 rounded-2xl bg-cream border border-ink/10 px-5 py-4 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-deepest"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-pink-soft/60 text-2xl">
                  {tool.emoji}
                </span>
                <div>
                  <p className="font-rounded text-base font-semibold text-ink group-hover:text-pink-deepest transition-colors">
                    {tool.label}
                  </p>
                  <p className="mt-0.5 font-body text-sm text-ink/65">{tool.description}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <footer className="text-center">
          <Link
            href="/"
            className="font-rounded text-sm font-semibold text-ink/55 hover:text-pink-deepest transition-colors"
          >
            ← babapetcare.com
          </Link>
        </footer>
      </div>
    </main>
  );
}
