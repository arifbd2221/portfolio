# Portfolio

A personal portfolio site: AI-forward, animation-heavy, with a 3D centerpiece
and a Claude-powered chat that can navigate the 3D scene. Premium, distinctive,
fast.

Built phase-by-phase per [`portfolio-build-phases.md`](./portfolio-build-phases.md).
**Status: Phase 0 — scaffold & foundations.**

## Stack

Next.js 16 (App Router) · TypeScript (strict) · Tailwind CSS v4 (CSS-first) ·
`motion` · `gsap` (+ ScrollTrigger) · `lenis` · `three` + `@react-three/fiber` +
`@react-three/drei` · `zustand` · Vercel AI SDK (`ai` + `@ai-sdk/anthropic` +
`@ai-sdk/react`) · `@next/mdx` + `rehype-pretty-code` + `shiki` ·
`yet-another-react-lightbox` · `next-themes`. Deploy target: Vercel.

## Getting started

```bash
pnpm install
cp .env.example .env.local   # then fill in values (see below)
pnpm dev                     # http://localhost:3000
```

## Scripts

| Script           | What it does                     |
| ---------------- | -------------------------------- |
| `pnpm dev`       | Start the dev server (Turbopack) |
| `pnpm build`     | Production build                 |
| `pnpm start`     | Serve the production build       |
| `pnpm lint`      | ESLint (`eslint-config-next`)    |
| `pnpm typecheck` | `tsc --noEmit` type check        |

## Environment variables

Copy `.env.example` → `.env.local`. Secrets are read from env only — never
hardcoded or committed.

| Variable                   | Required | Purpose                                                                 |
| -------------------------- | -------- | ----------------------------------------------------------------------- |
| `ANTHROPIC_API_KEY`        | Phase 7  | Anthropic API key for the AI chat.                                      |
| `AI_MODEL`                 | optional | Chat model id. Defaults to `claude-sonnet-4-6`.                         |
| `NEXT_PUBLIC_SITE_URL`     | optional | Absolute base URL for metadata/OG. Defaults to `http://localhost:3000`. |
| `UPSTASH_REDIS_REST_URL`   | optional | Distributed chat rate limiting. Falls back to in-memory when absent.    |
| `UPSTASH_REDIS_REST_TOKEN` | optional | Pairs with the Upstash URL above.                                       |

## Architecture

- **Single `zustand` store** (`src/lib/store.ts`) is the shared bus:
  `scrollProgress`, `activeSection`, `sceneCommand`. Sections never talk to each
  other directly — they go through the store.
- **Lenis is the only scroll source** (`src/lib/lenis.tsx`). GSAP is wired to it;
  the R3F scene _reads_ `scrollProgress`/`sceneCommand` in `useFrame` — it never
  owns scroll. (Wiring lands in Phase 1.)
- **The 3D canvas is lazy** (`next/dynamic`, `ssr: false`) and never blocks first
  paint. (Phase 2.)
- **AI drives the 3D**: chat tool calls become `sceneCommand` values that move
  the camera. (Phase 7.)
- **Content is data**: bio, projects, story beats, and gallery live in typed
  files under `src/content`; the blog is MDX.

### Folder layout

```
src/
  app/             # routes (App Router)
  components/      # UI
    chat/          # AI chat (Phase 7)
    three/         # 3D scene (Phase 2)
  lib/             # store.ts, lenis.tsx, utils
  content/         # bio.ts, projects.ts, story.ts, gallery.ts
    posts/         # MDX blog posts (Phase 5)
public/
  images/          # images + gallery/, projects/, story/
  models/          # 3D models
```

## Conventions

- React Server Components by default; `"use client"` only where needed.
- Every animation is gated behind `prefers-reduced-motion`.
- Keyboard-navigable; alt text everywhere.
- Conventional commits.
