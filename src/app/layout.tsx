import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { HickupHeader } from "@/components/ui/logo";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hickup - MCP Tools for Agent Orchestration",
  description: "Custom agent orchestration tools for businesses. RAG Knowledge Systems, Multi-Agent Databases, and Agent Email Protocol.",
  keywords: ["MCP", "AI agents", "agent orchestration", "RAG", "multi-agent"],
  authors: [{ name: "Hickup" }],
  openGraph: {
    title: "Hickup - MCP Tools for Agent Orchestration",
    description: "Custom agent orchestration tools for businesses.",
    url: "https://hickup.xyz",
    siteName: "Hickup",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hickup - MCP Tools for Agent Orchestration",
    description: "Custom agent orchestration tools for businesses.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <HickupHeader />
        {children}
      </body>
    </html>
  );
}
