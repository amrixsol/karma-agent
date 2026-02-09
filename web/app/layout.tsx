import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Karma — AI Credit Cards",
  description:
    "Credit cards for AI agents, backed by USDC on Solana. Fund with crypto, spend anywhere.",
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
