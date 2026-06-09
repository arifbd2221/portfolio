import "./globals.css";
import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import { ThemeToggle } from "@/components/theme-toggle";
import { ChatLauncher } from "@/components/chat/ChatLauncher";
import { SceneMount } from "@/components/three/SceneMount";
import { bio } from "@/content/bio";
import { siteUrl } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${bio.name} — ${bio.role}`,
    template: `%s · ${bio.name}`,
  },
  description: bio.summary,
  openGraph: {
    title: `${bio.name} — Portfolio`,
    description: bio.tagline,
    type: "website",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: `${bio.name} — Portfolio`,
    description: bio.tagline,
  },
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": `${siteUrl}/feed.xml` },
  },
};

// Next 16: themeColor/viewport live in a dedicated `viewport` export,
// not in `metadata`.
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0b" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="min-h-dvh bg-background font-sans text-foreground antialiased">
        <Providers>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-foreground"
          >
            Skip to content
          </a>

          {/* 3D canvas mount point — lazy scene wired in Phase 2. */}
          <SceneMount />

          <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border/60 bg-background/70 px-6 py-4 backdrop-blur-md">
            <Link
              href="/"
              className="font-mono text-sm font-medium tracking-tight text-foreground"
            >
              {bio.name.toLowerCase()}
              <span className="text-accent">.</span>
            </Link>
            <nav className="flex items-center gap-2">
              <Link
                href="/blog"
                className="rounded-full px-3 py-1.5 text-sm text-foreground/80 transition-colors hover:bg-surface hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Blog
              </Link>
              <ThemeToggle />
            </nav>
          </header>

          <main id="main">{children}</main>

          <footer className="relative z-0 border-t border-border/60 bg-background/80 px-6 py-10 text-sm text-muted">
            <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4">
              <p>
                © {new Date().getFullYear()} {bio.name}
              </p>
              <nav className="flex flex-wrap gap-4" aria-label="Footer">
                {bio.socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    {s.label}
                  </a>
                ))}
                <a
                  href="/feed.xml"
                  className="transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  RSS
                </a>
              </nav>
            </div>
          </footer>

          {/* Global chat launcher — Claude chat that can drive the 3D scene. */}
          <ChatLauncher />
        </Providers>
      </body>
    </html>
  );
}
