import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Q · your cue to close",
  description: "Every closer needs a Q. Q listens to your sales call and shows you, at a glance, what the best salespeople would do next.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full">
      <body className="tg min-h-full flex flex-col">{children}</body>
    </html>
  );
}
