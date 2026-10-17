import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Q · your cue to close",
  description: "A live closing coach that flashes five-word cues learned from deals real people won.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full">
      <body className="tg min-h-full flex flex-col">{children}</body>
    </html>
  );
}
