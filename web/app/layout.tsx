import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Karma Card — Agentic Credit Cards",
  description:
    "Programmable credit card infrastructure for AI agents, built on Solana. Fund with USDC, spend anywhere.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
