import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://noahdelacalzada.com"),
  title: "Portfolia — Noah's AI Assistant",
  description:
    "Chat with Portfolia to learn about Noah's projects and background.",
  openGraph: {
    title: "Portfolia — Noah's AI Assistant",
    description:
      "Noah's AI portfolio you can actually talk to — ask about his projects, background, and the RAG pipeline answering you.",
    url: "https://noahdelacalzada.com",
    siteName: "Portfolia",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Portfolia — Noah's AI Assistant",
    description:
      "Noah's AI portfolio you can actually talk to — ask about his projects, background, and the RAG pipeline answering you.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-900 text-zinc-100 h-screen">
        {children}
      </body>
    </html>
  );
}
