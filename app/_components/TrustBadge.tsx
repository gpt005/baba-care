import type { ReactNode } from "react";

type Props = {
  icon?: ReactNode;
  label: ReactNode;
};

export function TrustBadge({ icon, label }: Props) {
  return (
    <div className="flex items-center gap-2 whitespace-nowrap rounded-full border border-ink/10 bg-cream/80 px-4 py-2 backdrop-blur-sm shadow-[0_2px_8px_-4px_rgba(43,42,40,0.12)]">
      <span aria-hidden="true" className="text-sage-deep" style={{ display: "inline-flex" }}>
        {icon ?? <CheckMark />}
      </span>
      <span className="font-rounded text-sm font-semibold text-ink">{label}</span>
    </div>
  );
}

function CheckMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
