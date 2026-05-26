import { InstagramIcon, MessageIcon } from "./Icons";
import { SITE, SMS_HREF } from "../_lib/site";

export function StickyMobileBar() {
  return (
    <div
      role="region"
      aria-label="Quick contact"
      className="md:hidden fixed inset-x-0 bottom-0 z-30 border-t border-ink/10 bg-cream/95 backdrop-blur-md shadow-[0_-6px_18px_-10px_rgba(43,42,40,0.25)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="grid grid-cols-2 gap-2 p-3">
        <a
          href={SMS_HREF}
          className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-cream border border-ink/15 px-3 py-3 text-ink font-rounded text-xs font-semibold active:scale-95 transition-transform"
        >
          <MessageIcon size={20} />
          Text
        </a>
        <a
          href={SITE.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-cream border border-ink/15 px-3 py-3 text-ink font-rounded text-xs font-semibold active:scale-95 transition-transform"
        >
          <InstagramIcon size={20} />
          DM
        </a>
      </div>
    </div>
  );
}
