import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://ai-career-radar-web.vercel.app";
const title = "AI Career Radar — what AI companies actually hire for";
const description =
  "Evidence-grounded gap reports against 443 real AI engineering JDs. Paste your resume + the role you want; get a personalized 5-section report in under 60 seconds.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  applicationName: "AI Career Radar",
  keywords: [
    "AI engineering",
    "career",
    "gap analysis",
    "RAG",
    "LLM",
    "job market",
    "resume review",
    "Claude",
    "Anthropic",
    "OpenAI",
  ],
  openGraph: {
    type: "website",
    url: siteUrl,
    title,
    description,
    siteName: "AI Career Radar",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
