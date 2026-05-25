import type { ReactNode } from "react";
import { cn } from "../_lib/cn";

type Props = {
  children: ReactNode;
  className?: string;
  size?: "default" | "narrow" | "wide";
};

const sizes = {
  default: "max-w-6xl",
  narrow: "max-w-3xl",
  wide: "max-w-7xl",
};

export function Container({ children, className, size = "default" }: Props) {
  return (
    <div className={cn("mx-auto w-full px-5 sm:px-6 lg:px-8", sizes[size], className)}>
      {children}
    </div>
  );
}
