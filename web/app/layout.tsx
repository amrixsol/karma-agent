import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://agents.karmapay.xyz"),
  title: "Karma Card — The credit card built for agents",
  description:
    "Give your AI agent a credit card with programmable limits, scoped API keys, and full human control. Fund with USDC on Solana, accepted at 150M+ merchants.",
  keywords: ["AI agent", "credit card", "Solana", "USDC", "programmable payments", "agent economy"],
  openGraph: {
    title: "Karma Card — The credit card built for agents",
    description:
      "Give your AI agent a credit card with programmable limits, scoped API keys, and full human control. Fund with USDC on Solana.",
    siteName: "Karma Card",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Karma Card — The credit card built for agents",
    description:
      "Give your AI agent a credit card with programmable limits, scoped API keys, and full human control.",
    creator: "@karmawallet",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/karma-logo.png",
  },
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
