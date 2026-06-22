import type { Metadata } from "next";
import { ToolsHub } from "./ToolsHub";

export const metadata: Metadata = {
  title: "tools",
  robots: { index: false, follow: false },
};

export default function ToolsPage() {
  return <ToolsHub />;
}
