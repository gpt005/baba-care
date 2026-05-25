import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base(size = 20): SVGProps<SVGSVGElement> {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
  } as SVGProps<SVGSVGElement>;
}

export function InstagramIcon({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function PhoneIcon({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

export function MessageIcon({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

export function MailIcon({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-10 6L2 7" />
    </svg>
  );
}

export function PawIcon({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <circle cx="6" cy="11" r="2" />
      <circle cx="10" cy="6" r="2" />
      <circle cx="14" cy="6" r="2" />
      <circle cx="18" cy="11" r="2" />
      <path d="M8 17c0-3 2-5 4-5s4 2 4 5a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3z" />
    </svg>
  );
}

export function HouseIcon({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2z" />
    </svg>
  );
}

export function HeartIcon({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export function CameraIcon({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

export function ShieldIcon({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

export function StarIcon({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest} fill="currentColor" stroke="none">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export function CheckIcon({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest} strokeWidth={3}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function ChevronDownIcon({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export function MenuIcon({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

export function CloseIcon({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function MapPinIcon({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M20 10c0 7-8 12-8 12s-8-5-8-12a8 8 0 0 1 16 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export function WalkIcon({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <circle cx="13" cy="4" r="2" />
      <path d="m9 20 3-6 4 2-3 6" />
      <path d="m6 8 4-2 5 4 2 4-3 2-3-2-2 3" />
    </svg>
  );
}

export function BedIcon({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M2 17v-7a2 2 0 0 1 2-2h7v8" />
      <path d="M2 17h20" />
      <path d="M22 17v-3a4 4 0 0 0-4-4h-7" />
      <circle cx="7" cy="11" r="2" />
    </svg>
  );
}

export function SunIcon({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}
