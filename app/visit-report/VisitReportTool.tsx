"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { LuArrowLeft, LuFilePlus } from "react-icons/lu";
import { Logo } from "../_components/Logo";
import { Button } from "../_components/Button";
import { cn } from "../_lib/cn";

const INVOICE_URL = process.env.NEXT_PUBLIC_INVOICE_URL ?? "http://localhost:8000";
const STORAGE_KEY = "baba.invoice.password";

type Status = "booting" | "locked" | "checking" | "unlocked" | "submitting" | "success";
type Mode = "single" | "multi";
type FoodLevel = "well" | "some" | "skipped";
type WaterLevel = "well" | "little" | "not much";
type MoodValue = "happy" | "excited" | "playful" | "silly" | "calm" | "cuddly" | "curious" | "tired" | "clingy";

const ACTIVITIES = ["Walk", "Play", "Feeding", "Brushing", "Bath", "Snuggles", "Outdoor"] as const;

const MOODS: { value: MoodValue; emoji: string; label: string }[] = [
  { value: "happy", emoji: "😄", label: "Happy" },
  { value: "excited", emoji: "🤩", label: "Excited" },
  { value: "playful", emoji: "🎉", label: "Playful" },
  { value: "silly", emoji: "🤪", label: "Silly" },
  { value: "calm", emoji: "😌", label: "Calm" },
  { value: "cuddly", emoji: "🥰", label: "Cuddly" },
  { value: "curious", emoji: "🐾", label: "Curious" },
  { value: "tired", emoji: "😴", label: "Tired" },
  { value: "clingy", emoji: "🥺", label: "Clingy" },
];

const FOOD_OPTIONS: { value: FoodLevel; label: string }[] = [
  { value: "well", label: "Ate well" },
  { value: "some", label: "Ate some" },
  { value: "skipped", label: "Skipped" },
];

const WATER_OPTIONS: { value: WaterLevel; label: string }[] = [
  { value: "well", label: "Drank well" },
  { value: "little", label: "A little" },
  { value: "not much", label: "Not much" },
];

type DayForm = {
  date: string;
  day_label: string;
  activities: string[];
  food_level: FoodLevel;
  water_level: WaterLevel;
  pee_count: string;
  poop_count: string;
  mood: MoodValue;
  notes: string;
};

type SingleForm = {
  pet_name: string;
  service_date: string;
  activities: string[];
  food_level: FoodLevel;
  water_level: WaterLevel;
  pee_count: string;
  poop_count: string;
  mood: MoodValue;
  notes: string;
};

type MultiForm = {
  pet_name: string;
  days: DayForm[];
  overall_notes: string;
};

function today(): string {
  return new Date().toISOString().split("T")[0];
}

function nextDate(from: string): string {
  const d = new Date(from);
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

function emptyDay(date: string, index: number): DayForm {
  return {
    date,
    day_label: `Day ${index + 1}`,
    activities: [],
    food_level: "well",
    water_level: "well",
    pee_count: "0",
    poop_count: "0",
    mood: "happy",
    notes: "",
  };
}

const INITIAL_SINGLE: SingleForm = {
  pet_name: "",
  service_date: today(),
  activities: [],
  food_level: "well",
  water_level: "well",
  pee_count: "0",
  poop_count: "0",
  mood: "happy",
  notes: "",
};

const INITIAL_MULTI: MultiForm = {
  pet_name: "",
  days: [emptyDay(today(), 0)],
  overall_notes: "",
};

// ── shared styles ─────────────────────────────────────────────────────────────

const fieldStyle =
  "w-full rounded-2xl border border-ink/15 bg-white dark:bg-white/10 px-4 py-2.5 font-body text-base text-ink " +
  "shadow-[inset_0_1px_2px_rgba(43,42,40,0.04)] " +
  "focus:outline-none focus:border-pink-deepest focus:ring-2 focus:ring-pink-deepest/20 " +
  "placeholder:text-ink/35";

const labelStyle = "block font-rounded text-sm font-semibold text-ink/80 mb-1.5";

function Card({ children, className }: { children: ReactNode; className?: string }) {
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

function safeFilename(petName: string, ext = "pdf"): string {
  const safe = petName.replace(/[^A-Za-z0-9_-]+/g, "_") || "pet";
  return `report-${safe}.${ext}`;
}

// ── reusable field widgets ────────────────────────────────────────────────────

function Toggle3<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex rounded-2xl border border-ink/15 overflow-hidden bg-white dark:bg-white/10 shadow-[inset_0_1px_2px_rgba(43,42,40,0.04)]">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "flex-1 py-2 font-rounded text-sm font-semibold transition-colors",
            value === opt.value
              ? "bg-pink-deepest text-cream"
              : "text-ink/65 hover:text-pink-deepest",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function MoodPicker({ value, onChange }: { value: MoodValue; onChange: (v: MoodValue) => void }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {MOODS.map((m) => (
        <button
          key={m.value}
          type="button"
          onClick={() => onChange(m.value)}
          className={cn(
            "flex flex-col items-center gap-0.5 rounded-2xl border px-3 py-2 transition-all",
            value === m.value
              ? "border-pink-deepest bg-pink-soft/40 shadow-sm"
              : "border-ink/10 bg-white dark:bg-white/10 hover:border-pink-deep",
          )}
        >
          <span className="text-xl">{m.emoji}</span>
          <span className={cn("font-rounded text-xs font-semibold",
            value === m.value ? "text-pink-deepest" : "text-ink/65")}>{m.label}</span>
        </button>
      ))}
    </div>
  );
}

function ActivitiesGrid({ checked, onChange }: { checked: string[]; onChange: (v: string[]) => void }) {
  function toggle(act: string) {
    onChange(checked.includes(act) ? checked.filter((a) => a !== act) : [...checked, act]);
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {ACTIVITIES.map((act) => {
        const on = checked.includes(act);
        return (
          <button
            key={act}
            type="button"
            onClick={() => toggle(act)}
            className={cn(
              "rounded-xl border px-3 py-2 font-rounded text-sm font-semibold transition-all",
              on
                ? "border-pink-deepest bg-pink-deepest text-cream"
                : "border-ink/10 bg-white dark:bg-white/10 text-ink/65 hover:border-pink-deep hover:text-ink",
            )}
          >
            {act}
          </button>
        );
      })}
    </div>
  );
}

function CounterField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-rounded text-sm font-semibold text-ink/80 w-10">{label}</span>
      <button
        type="button"
        onClick={() => onChange(String(Math.max(0, Number(value) - 1)))}
        className="h-8 w-8 rounded-full border border-ink/15 bg-white dark:bg-white/10 font-body text-lg text-ink/70 hover:text-pink-deepest transition-colors"
      >
        −
      </button>
      <span className="w-8 text-center font-body text-base font-semibold text-ink">{value}</span>
      <button
        type="button"
        onClick={() => onChange(String(Number(value) + 1))}
        className="h-8 w-8 rounded-full border border-ink/15 bg-white dark:bg-white/10 font-body text-lg text-ink/70 hover:text-pink-deepest transition-colors"
      >
        +
      </button>
    </div>
  );
}

function PhotoUpload({ photos, onChange }: { photos: string[]; onChange: (v: string[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    if (!files) return;
    const remaining = 3 - photos.length;
    const toAdd = Math.min(files.length, remaining);
    const promises: Promise<string>[] = [];
    for (let i = 0; i < toAdd; i++) {
      const file = files[i];
      promises.push(
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result as string;
            resolve(result.split(",")[1] ?? "");
          };
          reader.readAsDataURL(file);
        }),
      );
    }
    Promise.all(promises).then((bases) => onChange([...photos, ...bases]));
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {photos.map((b64, i) => (
          <div
            key={i}
            className="relative h-20 w-20 rounded-2xl overflow-hidden border border-pink-deep/30"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`data:image/*;base64,${b64}`}
              alt={`Photo ${i + 1}`}
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={() => onChange(photos.filter((_, j) => j !== i))}
              className="absolute top-1 right-1 h-5 w-5 rounded-full bg-ink/70 text-cream font-body text-xs flex items-center justify-center hover:bg-pink-deepest transition-colors"
            >
              ×
            </button>
          </div>
        ))}
        {photos.length < 3 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-ink/20 bg-white dark:bg-white/10 text-ink/45 hover:border-pink-deepest hover:text-pink-deepest transition-all"
          >
            <span className="text-xl">+</span>
            <span className="font-rounded text-xs">Add photo</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <p className="font-body text-xs text-ink/45">Up to 3 photos. Embedded in the PDF.</p>
    </div>
  );
}

// ── password gate ─────────────────────────────────────────────────────────────

function PasswordGate({ onUnlock }: { onUnlock: (key: string) => void }) {
  const [password, setPassword] = useState("");
  const [reveal, setReveal] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setChecking(true);
    try {
      const r = await fetch(`${INVOICE_URL}/auth/check`, {
        headers: { "X-API-Key": password },
      });
      if (r.ok) {
        if (remember) localStorage.setItem(STORAGE_KEY, password);
        onUnlock(password);
      } else if (r.status === 401) {
        setError("Incorrect password.");
      } else {
        setError(`Server error (${r.status}). Please try again.`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error.");
    } finally {
      setChecking(false);
    }
  }

  return (
    <Card className="max-w-md mx-auto">
      <h1 className="font-display text-3xl text-pink-deepest text-center">visit report</h1>
      <p className="mt-1 mb-6 text-center font-body text-sm text-ink/65">
        Enter the password to continue.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="vr-password" className={labelStyle}>Password</label>
          <div className="relative">
            <input
              id="vr-password"
              type={reveal ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={cn(fieldStyle, "pr-16")}
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
        <Button type="submit" variant="primary" size="lg" className="w-full" disabled={checking}>
          {checking ? "Checking…" : "Continue"}
        </Button>
      </form>
    </Card>
  );
}

// ── pdf preview ───────────────────────────────────────────────────────────────

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
          <label className="sr-only" htmlFor="download-format">Download format</label>
          <select
            id="download-format"
            value={fmt}
            onChange={(e) => setFmt(e.target.value as "pdf" | "png" | "jpg")}
            disabled={downloading}
            className={cn(fieldStyle, "w-auto py-2.5 pr-9 text-sm md:text-base")}
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
        title="Visit report preview"
        src={url}
        className="w-full h-[80vh] rounded-2xl border border-ink/15 bg-white"
      />
    </Card>
  );
}

// ── single visit form ─────────────────────────────────────────────────────────

function SingleVisitForm({ form, onChange }: { form: SingleForm; onChange: (f: SingleForm) => void }) {
  function set<K extends keyof SingleForm>(k: K, v: SingleForm[K]) {
    onChange({ ...form, [k]: v });
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelStyle}>Pet name *</label>
          <input
            type="text"
            value={form.pet_name}
            onChange={(e) => set("pet_name", e.target.value)}
            className={fieldStyle}
            placeholder="Biscuit"
            required
          />
        </div>
        <div>
          <label className={labelStyle}>Visit date *</label>
          <input
            type="date"
            value={form.service_date}
            onChange={(e) => set("service_date", e.target.value)}
            className={fieldStyle}
            required
          />
        </div>
      </div>

      <div>
        <label className={labelStyle}>Activities</label>
        <ActivitiesGrid checked={form.activities} onChange={(v) => set("activities", v)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelStyle}>Food</label>
          <Toggle3 options={FOOD_OPTIONS} value={form.food_level} onChange={(v) => set("food_level", v)} />
        </div>
        <div>
          <label className={labelStyle}>Water</label>
          <Toggle3 options={WATER_OPTIONS} value={form.water_level} onChange={(v) => set("water_level", v)} />
        </div>
      </div>

      <div>
        <label className={labelStyle}>Bathroom</label>
        <div className="flex gap-8">
          <CounterField label="🐾 Pee" value={form.pee_count} onChange={(v) => set("pee_count", v)} />
          <CounterField label="💩 Poop" value={form.poop_count} onChange={(v) => set("poop_count", v)} />
        </div>
      </div>

      <div>
        <label className={labelStyle}>Mood</label>
        <MoodPicker value={form.mood} onChange={(v) => set("mood", v)} />
      </div>

      <div>
        <label className={labelStyle}>Notes</label>
        <textarea
          rows={3}
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          className={cn(fieldStyle, "resize-none")}
          placeholder="Anything special to share with the owner…"
        />
      </div>
    </div>
  );
}

// ── multi-day form ────────────────────────────────────────────────────────────

function DayCard({
  day,
  index,
  onChange,
  onRemove,
}: {
  day: DayForm;
  index: number;
  onChange: (d: DayForm) => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(index === 0);

  function set<K extends keyof DayForm>(k: K, v: DayForm[K]) {
    onChange({ ...day, [k]: v });
  }

  return (
    <div className="rounded-2xl border border-ink/10 bg-white dark:bg-white/10 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((x) => !x)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-pink-soft/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="font-rounded text-sm font-semibold text-pink-deepest">{day.day_label || `Day ${index + 1}`}</span>
          <span className="font-body text-sm text-ink/55">{day.date}</span>
          {!expanded && day.mood && (
            <span className="text-base">{MOODS.find((m) => m.value === day.mood)?.emoji}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="h-6 w-6 rounded-full border border-ink/15 text-ink/45 hover:text-pink-deepest hover:border-pink-deepest transition-colors font-body text-sm flex items-center justify-center"
            aria-label="Remove day"
          >
            ×
          </button>
          <span className="font-body text-ink/45 text-sm">{expanded ? "▲" : "▼"}</span>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-ink/8">
          <div className="grid grid-cols-2 gap-3 pt-3">
            <div>
              <label className={labelStyle}>Date</label>
              <input
                type="date"
                value={day.date}
                onChange={(e) => set("date", e.target.value)}
                className={fieldStyle}
              />
            </div>
            <div>
              <label className={labelStyle}>Day label</label>
              <input
                type="text"
                value={day.day_label}
                onChange={(e) => set("day_label", e.target.value)}
                className={fieldStyle}
                placeholder={`Day ${index + 1}`}
              />
            </div>
          </div>

          <div>
            <label className={labelStyle}>Activities</label>
            <ActivitiesGrid checked={day.activities} onChange={(v) => set("activities", v)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelStyle}>Food</label>
              <Toggle3 options={FOOD_OPTIONS} value={day.food_level} onChange={(v) => set("food_level", v)} />
            </div>
            <div>
              <label className={labelStyle}>Water</label>
              <Toggle3 options={WATER_OPTIONS} value={day.water_level} onChange={(v) => set("water_level", v)} />
            </div>
          </div>

          <div>
            <label className={labelStyle}>Bathroom</label>
            <div className="flex gap-8">
              <CounterField label="🐾 Pee" value={day.pee_count} onChange={(v) => set("pee_count", v)} />
              <CounterField label="💩 Poop" value={day.poop_count} onChange={(v) => set("poop_count", v)} />
            </div>
          </div>

          <div>
            <label className={labelStyle}>Mood</label>
            <MoodPicker value={day.mood} onChange={(v) => set("mood", v)} />
          </div>

          <div>
            <label className={labelStyle}>Day notes</label>
            <input
              type="text"
              value={day.notes}
              onChange={(e) => set("notes", e.target.value)}
              className={fieldStyle}
              placeholder="Anything to note for this day…"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function MultiDayForm({ form, onChange }: { form: MultiForm; onChange: (f: MultiForm) => void }) {
  function setDay(i: number, d: DayForm) {
    const days = [...form.days];
    days[i] = d;
    onChange({ ...form, days });
  }

  function removeDay(i: number) {
    onChange({ ...form, days: form.days.filter((_, j) => j !== i) });
  }

  function addDay() {
    const lastDate = form.days[form.days.length - 1]?.date ?? today();
    const newDate = nextDate(lastDate);
    onChange({ ...form, days: [...form.days, emptyDay(newDate, form.days.length)] });
  }

  return (
    <div className="space-y-6">
      <div>
        <label className={labelStyle}>Pet name *</label>
        <input
          type="text"
          value={form.pet_name}
          onChange={(e) => onChange({ ...form, pet_name: e.target.value })}
          className={fieldStyle}
          placeholder="Biscuit"
          required
        />
      </div>

      <div className="space-y-3">
        {form.days.map((day, i) => (
          <DayCard
            key={i}
            day={day}
            index={i}
            onChange={(d) => setDay(i, d)}
            onRemove={() => removeDay(i)}
          />
        ))}

        {form.days.length < 14 && (
          <button
            type="button"
            onClick={addDay}
            className="w-full rounded-2xl border-2 border-dashed border-ink/15 py-3 font-rounded text-sm font-semibold text-ink/55 hover:border-pink-deepest hover:text-pink-deepest transition-all"
          >
            + Add day
          </button>
        )}
      </div>

      <div>
        <label className={labelStyle}>Overall notes</label>
        <textarea
          rows={3}
          value={form.overall_notes}
          onChange={(e) => onChange({ ...form, overall_notes: e.target.value })}
          className={cn(fieldStyle, "resize-none")}
          placeholder="Overall impressions for the whole stay…"
        />
      </div>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export function VisitReportTool() {
  const [status, setStatus] = useState<Status>(() =>
    typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY)
      ? "booting"
      : "locked",
  );
  const [apiKey, setApiKey] = useState("");
  const [mode, setMode] = useState<Mode>("single");
  const [singleForm, setSingleForm] = useState<SingleForm>(INITIAL_SINGLE);
  const [multiForm, setMultiForm] = useState<MultiForm>(INITIAL_MULTI);
  const [photos, setPhotos] = useState<string[]>([]);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfFilename, setPdfFilename] = useState("report.pdf");
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "booting") return;
    const stored = localStorage.getItem(STORAGE_KEY)!;
    fetch(`${INVOICE_URL}/auth/check`, { headers: { "X-API-Key": stored } })
      .then((r) => {
        if (r.ok) { setApiKey(stored); setStatus("unlocked"); }
        else { localStorage.removeItem(STORAGE_KEY); setStatus("locked"); }
      })
      .catch(() => setStatus("locked"));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  function handleUnlock(key: string) {
    setApiKey(key);
    setStatus("unlocked");
  }

  function handleSignOut() {
    if (typeof window !== "undefined") window.localStorage.removeItem(STORAGE_KEY);
    setApiKey("");
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl(null);
    setPdfBlob(null);
    setStatus("locked");
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
    setSingleForm(INITIAL_SINGLE);
    setMultiForm(INITIAL_MULTI);
    setPhotos([]);
  }

  function buildPayload() {
    if (mode === "single") {
      return {
        mode: "single" as const,
        pet_name: singleForm.pet_name.trim(),
        service_date: singleForm.service_date,
        activities: singleForm.activities,
        food_level: singleForm.food_level,
        water_level: singleForm.water_level,
        pee_count: Number(singleForm.pee_count),
        poop_count: Number(singleForm.poop_count),
        mood: singleForm.mood,
        notes: singleForm.notes,
        photos,
      };
    }
    return {
      mode: "multi" as const,
      pet_name: multiForm.pet_name.trim(),
      days: multiForm.days.map((d) => ({
        date: d.date,
        day_label: d.day_label || undefined,
        activities: d.activities,
        food_level: d.food_level,
        water_level: d.water_level,
        pee_count: Number(d.pee_count),
        poop_count: Number(d.poop_count),
        mood: d.mood,
        notes: d.notes,
      })),
      overall_notes: multiForm.overall_notes,
      photos,
    };
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    setStatus("submitting");
    try {
      const r = await fetch(`${INVOICE_URL}/visit-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-API-Key": apiKey },
        body: JSON.stringify(buildPayload()),
      });
      if (!r.ok) {
        if (r.status === 401) {
          localStorage.removeItem(STORAGE_KEY);
          setApiKey("");
          setStatus("locked");
          return;
        }
        const text = await r.text();
        let detail = text;
        try {
          const parsed = JSON.parse(text);
          detail = parsed.detail
            ? typeof parsed.detail === "string" ? parsed.detail : JSON.stringify(parsed.detail)
            : text;
        } catch { /* leave as-is */ }
        throw new Error(detail || `HTTP ${r.status}`);
      }
      const blob = await r.blob();
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      const url = URL.createObjectURL(blob);
      const petName = mode === "single" ? singleForm.pet_name : multiForm.pet_name;
      setPdfBlob(blob);
      setPdfUrl(url);
      setPdfFilename(safeFilename(petName));
      setStatus("success");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("unlocked");
    }
  }

  async function downloadAsImage(fmt: "png" | "jpg") {
    if (!pdfBlob) return;
    const DPI = 300;
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
      const petName = mode === "single" ? singleForm.pet_name : multiForm.pet_name;
      a.download = safeFilename(petName, fmt);
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Could not create image.");
    }
  }

  if (status === "booting") {
    return (
      <main className="min-h-screen bg-pink-soft/30 flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-pink-deepest border-t-transparent animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-pink-soft/30 px-4 pt-8 pb-16">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <header className="flex items-center justify-between">
          <Logo size="sm" />
          {(status === "unlocked" || status === "submitting" || status === "success") && (
            <button
              type="button"
              onClick={handleSignOut}
              className="font-rounded text-sm text-ink/60 hover:text-pink-deepest transition-colors"
            >
              Sign out
            </button>
          )}
        </header>

        {status === "locked" && <PasswordGate onUnlock={handleUnlock} />}

        {(status === "unlocked" || status === "submitting") && (
          <Card>
            <h1 className="font-display text-3xl text-pink-deepest">new visit report</h1>

            <div className="flex rounded-2xl border border-ink/15 overflow-hidden bg-white dark:bg-white/10 shadow-sm mt-6">
              {(["single", "multi"] as Mode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  disabled={status === "submitting"}
                  className={cn(
                    "flex-1 py-2.5 font-rounded text-sm font-semibold transition-colors",
                    mode === m
                      ? "bg-pink-deepest text-cream"
                      : "text-ink/65 hover:text-pink-deepest",
                  )}
                >
                  {m === "single" ? "Single Visit" : "Multi-Day Stay"}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              <fieldset disabled={status === "submitting"}>
                {mode === "single" ? (
                  <SingleVisitForm form={singleForm} onChange={setSingleForm} />
                ) : (
                  <MultiDayForm form={multiForm} onChange={setMultiForm} />
                )}

                <div className="mt-6">
                  <label className={labelStyle}>Photos (optional)</label>
                  <PhotoUpload photos={photos} onChange={setPhotos} />
                </div>
              </fieldset>

              {submitError && (
                <p role="alert" className="rounded-xl bg-pink-soft/40 border border-pink-deepest/30 px-3 py-2 text-sm text-pink-deepest">
                  {submitError}
                </p>
              )}

              <Button type="submit" variant="primary" size="lg" className="w-full" disabled={status === "submitting"}>
                {status === "submitting" ? "Generating PDF…" : "Generate Report"}
              </Button>
            </form>
          </Card>
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
