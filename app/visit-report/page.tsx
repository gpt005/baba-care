import type { Metadata } from "next";
import { VisitReportTool } from "./VisitReportTool";

export const metadata: Metadata = {
  title: "visit report",
  robots: { index: false, follow: false },
};

export default function VisitReportPage() {
  return <VisitReportTool />;
}
