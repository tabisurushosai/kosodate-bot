import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kosodate Bot",
  description: "保護者・支援者向け週次AI相談ボット"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
