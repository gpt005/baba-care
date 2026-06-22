"use client";

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import { LuArrowLeft, LuFilePlus } from "react-icons/lu";
import { Logo } from "../_components/Logo";
import { Button } from "../_components/Button";
import { cn } from "../_lib/cn";

const INVOICE_URL =
  process.env.NEXT_PUBLIC_INVOICE_URL ?? "http://localhost:8000";
const STORAGE_KEY = "baba.invoice.password";

type Status =
  | "booting"
  | "locked"
  | "checking"
  | "unlocked"
  | "submitting"
  | "success";

type ServiceRow = { service: string; qty: string; unit_price: string };

type FormState = {
  client: string;
  contact_info: string;
  pet_name: string;
  pet_sex: "M" | "F";
  breed: string;
  age_category: "junior" | "adult" | "senior";
  sterilization: boolean;
  service_date: string;
  service_time_range: string;
  services: ServiceRow[];
  discount_pct: string;
  tip: string;
  payment_method: string;
  payment_date: string;
};

const EMPTY_ROW: ServiceRow = { service: "", qty: "1", unit_price: "" };

const INITIAL: FormState = {
  client: "",
  contact_info: "",
  pet_name: "",
  pet_sex: "M",
  breed: "",
  age_category: "adult",
  sterilization: true,
  service_date: "",
  service_time_range: "",
  services: [{ ...EMPTY_ROW }],
  discount_pct: "0",
  tip: "0",
  payment_method: "",
  payment_date: "",
};

const fieldStyle =
  "w-full rounded-2xl border border-ink/15 bg-white dark:bg-white/10 px-4 py-2.5 font-body text-base text-ink " +
  "shadow-[inset_0_1px_2px_rgba(43,42,40,0.04)] " +
  "focus:outline-none focus:border-pink-deepest focus:ring-2 focus:ring-pink-deepest/20 " +
  "placeholder:text-ink/35";

const labelStyle =
  "block font-rounded text-sm font-semibold text-ink/80 mb-1.5";

function money(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function computeTotals(
  rows: ServiceRow[],
  discountPct: string,
  tip: string,
  ageCategory: FormState["age_category"],
) {
  const filledRows = rows.filter(
    (r) => r.service.trim() && (Number(r.qty) || 0) > 0,
  ).length;
  const ageSurcharge =
    ageCategory === "junior" || ageCategory === "senior" ? filledRows * 5 : 0;
  const subtotal =
    rows.reduce(
      (s, r) => s + (Number(r.qty) || 0) * (Number(r.unit_price) || 0),
      0,
    ) + ageSurcharge;
  const pct = Math.max(0, Math.min(100, Number(discountPct) || 0)) / 100;
  const tipAmount = Math.max(0, Number(tip) || 0);
  return {
    subtotal,
    discountAmount: subtotal * pct,
    total: subtotal * (1 - pct) + tipAmount,
  };
}

function buildPayload(form: FormState) {
  return {
    client: form.client.trim(),
    contact_info: form.contact_info,
    pet_name: form.pet_name.trim(),
    pet_sex: form.pet_sex,
    breed: form.breed.trim(),
    age_category: form.age_category,
    sterilization: form.sterilization,
    service_date: form.service_date.trim(),
    service_time_range: form.service_time_range.trim(),
    services: form.services.map((r) => ({
      service: r.service.trim(),
      qty: Number(r.qty) || 0,
      unit_price: Number(r.unit_price) || 0,
    })),
    discount: (Number(form.discount_pct) || 0) / 100,
    tip: Number(form.tip) || 0,
    payment_method: form.payment_method.trim(),
    payment_date: form.payment_date.trim(),
  };
}

function safeFilename(client: string, ext = "pdf"): string {
  const safe = client.replace(/[^A-Za-z0-9_-]+/g, "_") || "client";
  return `invoice-${safe}.${ext}`;
}

export function InvoiceTool() {
  const [status, setStatus] = useState<Status>("booting");
  const [password, setPassword] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [remember, setRemember] = useState(false);
  const [gateError, setGateError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfFilename, setPdfFilename] = useState<string>("invoice.pdf");

  // On mount: try a stored password silently. If it validates, unlock.
  // Initial state is "booting" to keep SSR HTML deterministic; the localStorage
  // read happens client-side only.
  useEffect(() => {
    const stored =
      typeof window !== "undefined"
        ? window.localStorage.getItem(STORAGE_KEY)
        : null;
    if (!stored) {
      Promise.resolve().then(() => setStatus("locked"));
      return;
    }
    Promise.resolve().then(() => setRemember(true));
    fetch(`${INVOICE_URL}/auth/check`, { headers: { "X-API-Key": stored } })
      .then((res) => {
        if (res.ok) {
          setPassword(stored);
          setStatus("unlocked");
        } else {
          window.localStorage.removeItem(STORAGE_KEY);
          setStatus("locked");
        }
      })
      .catch(() => setStatus("locked"));
  }, []);

  // Revoke blob URLs when they change or on unmount.
  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  const totals = useMemo(
    () =>
      computeTotals(
        form.services,
        form.discount_pct,
        form.tip,
        form.age_category,
      ),
    [form.services, form.discount_pct, form.tip, form.age_category],
  );

  async function handleGateSubmit(e: FormEvent) {
    e.preventDefault();
    setGateError(null);
    if (!passwordInput) {
      setGateError("Enter the password.");
      return;
    }
    setStatus("checking");
    try {
      const res = await fetch(`${INVOICE_URL}/auth/check`, {
        headers: { "X-API-Key": passwordInput },
      });
      if (res.ok) {
        if (remember) window.localStorage.setItem(STORAGE_KEY, passwordInput);
        else window.localStorage.removeItem(STORAGE_KEY);
        setPassword(passwordInput);
        setPasswordInput("");
        setStatus("unlocked");
      } else if (res.status === 401) {
        setGateError("Incorrect password.");
        setStatus("locked");
      } else {
        setGateError(`Server error (${res.status}). Please try again.`);
        setStatus("locked");
      }
    } catch (err) {
      setGateError(err instanceof Error ? err.message : "Network error.");
      setStatus("locked");
    }
  }

  function handleSignOut() {
    if (typeof window !== "undefined")
      window.localStorage.removeItem(STORAGE_KEY);
    setPassword("");
    setRemember(false);
    setForm(INITIAL);
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl(null);
    setPdfBlob(null);
    setStatus("locked");
  }

  async function handleInvoiceSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    setStatus("submitting");
    try {
      const payload = buildPayload(form);
      const res = await fetch(`${INVOICE_URL}/invoice`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": password,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        if (res.status === 401) {
          if (typeof window !== "undefined")
            window.localStorage.removeItem(STORAGE_KEY);
          setPassword("");
          setStatus("locked");
          setGateError("Session expired. Please sign in again.");
          return;
        }
        const text = await res.text();
        let detail = text;
        try {
          const parsed = JSON.parse(text);
          detail = parsed.detail
            ? typeof parsed.detail === "string"
              ? parsed.detail
              : JSON.stringify(parsed.detail)
            : text;
        } catch {
          /* leave as-is */
        }
        throw new Error(detail || `HTTP ${res.status}`);
      }
      const blob = await res.blob();
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setPdfBlob(blob);
      setPdfFilename(safeFilename(form.client));
      setStatus("success");
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Something went wrong.",
      );
      setStatus("unlocked");
    }
  }

  function handleBackToForm() {
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl(null);
    setPdfBlob(null);
    setSubmitError(null);
    setStatus("unlocked");
  }

  function handleMakeAnother() {
    handleBackToForm();
    setForm(INITIAL);
  }

  // Render the generated PDF (already in the browser) to a raster image and
  // trigger a download. Runs entirely client-side via pdf.js — no extra API call.
  async function downloadAsImage(fmt: "png" | "jpg") {
    if (!pdfBlob) return;
    const DPI = 300; // PDF user space is 72 DPI → scale up to print quality
    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

      const data = await pdfBlob.arrayBuffer();
      const doc = await pdfjs.getDocument({ data }).promise;
      const page = await doc.getPage(1);
      const viewport = page.getViewport({ scale: DPI / 72 });

      const canvas = document.createElement("canvas");
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get canvas context.");
      // Flatten onto white so JPEG (no alpha channel) never shows black fringes.
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvas, canvasContext: ctx, viewport }).promise;

      const mime = fmt === "png" ? "image/png" : "image/jpeg";
      const out: Blob | null = await new Promise((resolve) =>
        canvas.toBlob(resolve, mime, fmt === "jpg" ? 0.9 : undefined),
      );
      if (!out) throw new Error("Could not encode image.");
      const url = URL.createObjectURL(out);
      const a = document.createElement("a");
      a.href = url;
      a.download = safeFilename(form.client, fmt);
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Could not create image.",
      );
    }
  }

  return (
    <main className="min-h-screen bg-pink-soft/30 px-4 pt-8 pb-16">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <header className="flex items-center justify-between">
          <Logo size="sm" />
          {(status === "unlocked" ||
            status === "submitting" ||
            status === "success") && (
            <button
              type="button"
              onClick={handleSignOut}
              className="font-rounded text-sm text-ink/60 hover:text-pink-deepest transition-colors"
            >
              Sign out
            </button>
          )}
        </header>

        {status === "booting" && <BootingCard />}

        {(status === "locked" || status === "checking") && (
          <PasswordGate
            password={passwordInput}
            onPasswordChange={setPasswordInput}
            remember={remember}
            onRememberChange={setRemember}
            error={gateError}
            checking={status === "checking"}
            onSubmit={handleGateSubmit}
          />
        )}

        {(status === "unlocked" || status === "submitting") && (
          <InvoiceForm
            form={form}
            onChange={setForm}
            totals={totals}
            submitting={status === "submitting"}
            error={submitError}
            onSubmit={handleInvoiceSubmit}
          />
        )}

        {status === "success" && pdfUrl && (
          <PdfPreview
            url={pdfUrl}
            filename={pdfFilename}
            onDownloadImage={downloadAsImage}
            onBack={handleBackToForm}
            onMakeAnother={handleMakeAnother}
          />
        )}

        <footer className="pt-2 text-center">
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 font-rounded text-sm font-semibold text-ink/60 hover:text-pink-deepest transition-colors"
          >
            ← tools
          </Link>
        </footer>
      </div>
    </main>
  );
}

function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-3xl bg-cream border border-ink/10 shadow-[0_8px_28px_-16px_rgba(43,42,40,0.25)] p-6 md:p-8",
        className,
      )}
    >
      {children}
    </section>
  );
}

function BootingCard() {
  return (
    <Card>
      <p className="font-body text-ink/70 text-center">Loading…</p>
    </Card>
  );
}

function PasswordGate({
  password,
  onPasswordChange,
  remember,
  onRememberChange,
  error,
  checking,
  onSubmit,
}: {
  password: string;
  onPasswordChange: (v: string) => void;
  remember: boolean;
  onRememberChange: (v: boolean) => void;
  error: string | null;
  checking: boolean;
  onSubmit: (e: FormEvent) => void;
}) {
  const [reveal, setReveal] = useState(false);
  return (
    <Card className="max-w-md mx-auto">
      <h1 className="font-display text-3xl text-pink-deepest text-center">
        invoice tool
      </h1>
      <p className="mt-1 mb-6 text-center font-body text-sm text-ink/65">
        Enter the password to continue.
      </p>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className={labelStyle}>
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={reveal ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              className={cn(fieldStyle, "pr-16")}
              disabled={checking}
              autoFocus
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
            onChange={(e) => onRememberChange(e.target.checked)}
            className="h-4 w-4 rounded border-ink/30 accent-pink-deepest"
            disabled={checking}
          />
          Stay signed in on this device
        </label>
        {error && (
          <p
            role="alert"
            className="rounded-xl bg-pink-soft/40 border border-pink-deepest/30 px-3 py-2 text-sm text-pink-deepest"
          >
            {error}
          </p>
        )}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={checking}
        >
          {checking ? "Checking…" : "Continue"}
        </Button>
      </form>
    </Card>
  );
}

function InvoiceForm({
  form,
  onChange,
  totals,
  submitting,
  error,
  onSubmit,
}: {
  form: FormState;
  onChange: (next: FormState) => void;
  totals: { subtotal: number; discountAmount: number; total: number };
  submitting: boolean;
  error: string | null;
  onSubmit: (e: FormEvent) => void;
}) {
  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    onChange({ ...form, [key]: value });

  const updateRow = (idx: number, patch: Partial<ServiceRow>) =>
    onChange({
      ...form,
      services: form.services.map((r, i) =>
        i === idx ? { ...r, ...patch } : r,
      ),
    });

  const addRow = () => {
    if (form.services.length >= 12) return;
    onChange({ ...form, services: [...form.services, { ...EMPTY_ROW }] });
  };

  const removeRow = (idx: number) => {
    if (form.services.length <= 1) return;
    onChange({
      ...form,
      services: form.services.filter((_, i) => i !== idx),
    });
  };

  return (
    <Card>
      <h1 className="font-display text-3xl text-pink-deepest">new invoice</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-6">
        <fieldset className="space-y-4" disabled={submitting}>
          <legend className="font-rounded text-xs font-semibold uppercase tracking-[0.18em] text-ink/55">
            Client
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="client" className={labelStyle}>
                Client name *
              </label>
              <input
                id="client"
                type="text"
                required
                value={form.client}
                onChange={(e) => update("client", e.target.value)}
                className={fieldStyle}
                placeholder="Kristen & Alex"
              />
            </div>
            <div>
              <label htmlFor="contact_info" className={labelStyle}>
                Contact info
              </label>
              <textarea
                id="contact_info"
                rows={2}
                value={form.contact_info}
                onChange={(e) => update("contact_info", e.target.value)}
                className={fieldStyle}
                placeholder={"810-357-3675\n319-594-3229"}
              />
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-4" disabled={submitting}>
          <legend className="font-rounded text-xs font-semibold uppercase tracking-[0.18em] text-ink/55">
            Pet
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="pet_name" className={labelStyle}>
                Pet name *
              </label>
              <input
                id="pet_name"
                type="text"
                required
                value={form.pet_name}
                onChange={(e) => update("pet_name", e.target.value)}
                className={fieldStyle}
                placeholder="Leo"
              />
            </div>
            <div>
              <label htmlFor="breed" className={labelStyle}>
                Breed *
              </label>
              <input
                id="breed"
                type="text"
                required
                value={form.breed}
                onChange={(e) => update("breed", e.target.value)}
                className={fieldStyle}
                placeholder="Poodle"
              />
            </div>
            <div>
              <span className={labelStyle}>Age category *</span>
              <div className="flex gap-2">
                {(["junior", "adult", "senior"] as const).map((cat) => (
                  <label
                    key={cat}
                    className={cn(
                      "flex-1 cursor-pointer rounded-2xl border px-4 py-2.5 text-center font-rounded font-semibold transition-colors capitalize",
                      form.age_category === cat
                        ? "border-pink-deepest bg-pink-deepest text-cream"
                        : "border-ink/15 bg-white dark:bg-white/10 text-ink/70 hover:border-pink-deepest/50",
                    )}
                  >
                    <input
                      type="radio"
                      name="age_category"
                      value={cat}
                      checked={form.age_category === cat}
                      onChange={() => update("age_category", cat)}
                      className="sr-only"
                    />
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </label>
                ))}
              </div>
              <p className="text-xs text-ink/50 mt-1">Cats are always Adult.</p>
            </div>
            <div>
              <span className={labelStyle}>Sex *</span>
              <div className="flex gap-2">
                {(["M", "F"] as const).map((s) => (
                  <label
                    key={s}
                    className={cn(
                      "flex-1 cursor-pointer rounded-2xl border px-4 py-2.5 text-center font-rounded font-semibold transition-colors",
                      form.pet_sex === s
                        ? "border-pink-deepest bg-pink-deepest text-cream"
                        : "border-ink/15 bg-white dark:bg-white/10 text-ink/70 hover:border-pink-deepest/50",
                    )}
                  >
                    <input
                      type="radio"
                      name="pet_sex"
                      value={s}
                      checked={form.pet_sex === s}
                      onChange={() => update("pet_sex", s)}
                      className="sr-only"
                    />
                    {s === "M" ? "Male" : "Female"}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <label className="flex items-center gap-2 font-body text-sm text-ink/80 select-none">
            <input
              type="checkbox"
              checked={form.sterilization}
              onChange={(e) => update("sterilization", e.target.checked)}
              className="h-4 w-4 rounded border-ink/30 accent-pink-deepest"
            />
            Spayed / neutered
          </label>
        </fieldset>

        <fieldset className="space-y-4" disabled={submitting}>
          <legend className="font-rounded text-xs font-semibold uppercase tracking-[0.18em] text-ink/55">
            Service date
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="service_date" className={labelStyle}>
                Service date *
              </label>
              <input
                id="service_date"
                type="text"
                required
                value={form.service_date}
                onChange={(e) => update("service_date", e.target.value)}
                className={fieldStyle}
                placeholder="5/31/2026"
              />
            </div>
            <div>
              <label htmlFor="service_time_range" className={labelStyle}>
                Time range
              </label>
              <input
                id="service_time_range"
                type="text"
                value={form.service_time_range}
                onChange={(e) => update("service_time_range", e.target.value)}
                className={fieldStyle}
                placeholder="8:00am – 8:30am"
              />
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-3" disabled={submitting}>
          <legend className="font-rounded text-xs font-semibold uppercase tracking-[0.18em] text-ink/55">
            Services
          </legend>
          <div className="space-y-3">
            {form.services.map((row, idx) => {
              const amount =
                (Number(row.qty) || 0) * (Number(row.unit_price) || 0);
              return (
                <div
                  key={idx}
                  className="grid grid-cols-12 gap-2 items-end rounded-2xl bg-white/70 dark:bg-white/10 border border-ink/10 p-3"
                >
                  <div className="col-span-12 md:col-span-6">
                    <label className={labelStyle}>Service</label>
                    <input
                      type="text"
                      required
                      value={row.service}
                      onChange={(e) =>
                        updateRow(idx, { service: e.target.value })
                      }
                      className={fieldStyle}
                      placeholder="30M drop-in (feed + 15M walk)"
                    />
                  </div>
                  <div className="col-span-4 md:col-span-2">
                    <label className={labelStyle}>Qty</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      required
                      value={row.qty}
                      onChange={(e) => updateRow(idx, { qty: e.target.value })}
                      className={fieldStyle}
                    />
                  </div>
                  <div className="col-span-4 md:col-span-2">
                    <label className={labelStyle}>Unit $</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={row.unit_price}
                      onChange={(e) =>
                        updateRow(idx, { unit_price: e.target.value })
                      }
                      className={fieldStyle}
                      placeholder="25.00"
                    />
                  </div>
                  <div className="col-span-3 md:col-span-1 text-right font-rounded text-sm text-ink/70">
                    {money(amount)}
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeRow(idx)}
                      disabled={form.services.length <= 1}
                      className="h-9 w-9 rounded-full text-ink/50 hover:text-pink-deepest hover:bg-pink-soft/30 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink/50 transition-colors"
                      aria-label={`Remove row ${idx + 1}`}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <button
            type="button"
            onClick={addRow}
            disabled={form.services.length >= 12}
            className="font-rounded text-sm font-semibold text-pink-deepest hover:underline disabled:opacity-40"
          >
            + Add service row
          </button>
        </fieldset>

        <fieldset className="space-y-4" disabled={submitting}>
          <legend className="font-rounded text-xs font-semibold uppercase tracking-[0.18em] text-ink/55">
            Adjustments
          </legend>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="discount_pct" className={labelStyle}>
                Discount (%)
              </label>
              <input
                id="discount_pct"
                type="number"
                min="0"
                max="100"
                step="1"
                value={form.discount_pct}
                onChange={(e) => update("discount_pct", e.target.value)}
                className={fieldStyle}
              />
            </div>
            <div>
              <label htmlFor="tip" className={labelStyle}>
                Tip ($)
              </label>
              <input
                id="tip"
                type="number"
                min="0"
                step="0.01"
                value={form.tip}
                onChange={(e) => update("tip", e.target.value)}
                className={fieldStyle}
              />
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-4" disabled={submitting}>
          <legend className="font-rounded text-xs font-semibold uppercase tracking-[0.18em] text-ink/55">
            Payment
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="payment_method" className={labelStyle}>
                Method
              </label>
              <input
                id="payment_method"
                type="text"
                value={form.payment_method}
                onChange={(e) => update("payment_method", e.target.value)}
                className={fieldStyle}
                placeholder="Venmo"
              />
            </div>
            <div>
              <label htmlFor="payment_date" className={labelStyle}>
                Date
              </label>
              <input
                id="payment_date"
                type="text"
                value={form.payment_date}
                onChange={(e) => update("payment_date", e.target.value)}
                className={fieldStyle}
                placeholder="5/31/2026"
              />
            </div>
          </div>
        </fieldset>

        <div className="rounded-2xl bg-blush/60 border border-pink-deepest/15 p-4 font-rounded text-sm">
          <div className="flex justify-between text-ink/70">
            <span>Subtotal</span>
            <span>{money(totals.subtotal)}</span>
          </div>
          {totals.discountAmount > 0 && (
            <div className="flex justify-between text-ink/70">
              <span>Discount</span>
              <span>− {money(totals.discountAmount)}</span>
            </div>
          )}
          <div className="mt-1 flex justify-between text-base font-semibold text-pink-deepest border-t border-pink-deepest/20 pt-1">
            <span>Total</span>
            <span>{money(totals.total)}</span>
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-xl bg-pink-soft/40 border border-pink-deepest/30 px-3 py-2 text-sm text-pink-deepest"
          >
            {error}
          </p>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={submitting}
        >
          {submitting ? "Generating PDF…" : "Generate invoice"}
        </Button>
      </form>
    </Card>
  );
}

function PdfPreview({
  url,
  filename,
  onDownloadImage,
  onBack,
  onMakeAnother,
}: {
  url: string;
  filename: string;
  onDownloadImage: (fmt: "png" | "jpg") => Promise<void>;
  onBack: () => void;
  onMakeAnother: () => void;
}) {
  const [fmt, setFmt] = useState<"pdf" | "png" | "jpg">("png");
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    if (downloading) return;
    if (fmt === "pdf") {
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      return;
    }
    setDownloading(true);
    try {
      await onDownloadImage(fmt);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-cream px-3.5 py-2 font-rounded text-sm font-semibold text-ink/60 shadow-sm hover:text-pink-deepest hover:border-pink-deepest transition-colors"
          >
            <LuArrowLeft className="h-4 w-4" />
            Edit
          </button>
          <h1 className="font-display text-3xl text-pink-deepest">preview</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onMakeAnother}
            className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-cream px-3.5 py-2 font-rounded text-sm font-semibold text-ink/60 shadow-sm hover:text-pink-deepest hover:border-pink-deepest transition-colors"
          >
            <LuFilePlus className="h-4 w-4" />
            New
          </button>
          <label className="sr-only" htmlFor="download-format">
            Download format
          </label>
          <select
            id="download-format"
            value={fmt}
            onChange={(e) => setFmt(e.target.value as "pdf" | "png" | "jpg")}
            disabled={downloading}
            className={cn(
              fieldStyle,
              "w-auto py-2.5 pr-9 text-sm md:text-base",
            )}
          >
            <option value="png">PNG</option>
            <option value="pdf">PDF</option>
            <option value="jpg">JPG</option>
          </select>
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-full font-rounded font-semibold transition-all duration-200 ease-out",
              "bg-pink-deepest text-cream shadow-[0_6px_16px_-6px_rgba(217,126,145,0.65)] hover:-translate-y-0.5",
              "px-5 py-2.5 text-sm md:text-base min-h-11",
              "disabled:opacity-60 disabled:hover:translate-y-0 disabled:cursor-not-allowed",
            )}
          >
            {downloading ? "Rendering…" : "Download"}
          </button>
        </div>
      </div>
      <iframe
        title="Invoice preview"
        src={url}
        className="w-full h-[80vh] rounded-2xl border border-ink/15 bg-white"
      />
    </Card>
  );
}
