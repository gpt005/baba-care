import type { Metadata } from "next";
import { InvoiceTool } from "./InvoiceTool";

export const metadata: Metadata = {
  title: "invoice tool",
  description: "Generate a branded baba pet care invoice PDF.",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://babapetcare.com/invoice" },
};

export default function InvoicePage() {
  return <InvoiceTool />;
}
