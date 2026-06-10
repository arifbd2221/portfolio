# Portfolio

A personal portfolio site: AI-forward, animation-heavy, with a 3D centerpiece
and a Gemini-powered chat that can navigate the 3D scene. Premium, distinctive,
fast.

Built phase-by-phase per [`portfolio-build-phases.md`](./portfolio-build-phases.md).

## Stack

Next.js 16 (App Router) · TypeScript (strict) · Tailwind CSS v4 (CSS-first) ·
`motion` · `gsap` (+ ScrollTrigger) · `lenis` · `three` + `@react-three/fiber` +
`@react-three/drei` · `zustand` · Vercel AI SDK v6 (`ai` + `@ai-sdk/google` +
`@ai-sdk/react`) · `@next/mdx` + `rehype-pretty-code` + `shiki` ·
`yet-another-react-lightbox` · `next-themes`. Deploy target: Vercel.

## Getting started

```bash
pnpm install
cp .env.example .env.local   # add GOOGLE_GENERATIVE_AI_API_KEY to use the chat
pnpm dev                     # http://localhost:3000
```

The site runs fully without an API key — only the AI chat needs
`GOOGLE_GENERATIVE_AI_API_KEY` (it returns a friendly 503 until set).

## Scripts

| Script              | What it does                          |
| ------------------- | ------------------------------------- |
| `pnpm dev`          | Dev server (Turbopack)                |
| `pnpm build`        | Production build                      |
| `pnpm start`        | Serve the production build            |
| `pnpm lint`         | ESLint (`eslint-config-next`)         |
| `pnpm typecheck`    | `tsc --noEmit`                        |
| `ANALYZE=true pnpm build` | Bundle analyzer (confirm 3D stays code-split) |

## Environment variables

| Variable                   | Required | Purpose                                                                 |
| -------------------------- | -------- | ----------------------------------------------------------------------- |
| `GOOGLE_GENERATIVE_AI_API_KEY` | for chat | Google Gemini API key (read server-side only).                     |
| `AI_MODEL`                 | optional | Chat model id. Defaults to `gemini-2.5-flash`.                          |
| `NEXT_PUBLIC_SITE_URL`     | optional | Absolute base URL for metadata/OG/sitemap. Defaults to localhost.       |
| `UPSTASH_REDIS_REST_URL`   | optional | Distributed chat rate limiting. Falls back to in-memory when absent.    |
| `UPSTASH_REDIS_REST_TOKEN` | optional | Pairs with the Upstash URL above.                                       |
| `AUTH_SECRET`              | admin    | Auth.js session secret (`npx auth secret`).                             |
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` | admin | GitHub OAuth app for `/admin` sign-in.                       |
| `ADMIN_GITHUB_LOGIN`       | admin    | The one GitHub username allowed into `/admin`.                          |

## Admin panel

A git-backed admin lives at `/admin` (plan: [`admin-build-phases.md`](./admin-build-phases.md)).
Sign-in is GitHub OAuth restricted to `ADMIN_GITHUB_LOGIN`. Every save is a
commit to this repo (with optimistic-locking conflict detection) and Vercel
redeploys — each save shows a "View commit" link and a live deploy-status pill
(when `VERCEL_TOKEN`/`VERCEL_PROJECT_ID` are set).

- **Posts** — MDX editor with metadata form, Shiki-highlighted live preview,
  drafts (hidden from index/RSS/sitemap/chat), publish-by-commit.
- **Media** — uploads resized + EXIF-stripped in the browser, committed to
  `public/images/<folder>/`; raster-only, 4 MB cap.
- **Projects / Bio / Story / Gallery** — structured editors validated by the
  exact zod schemas the site builds with; project ids lock after first save
  (they're the AI's `focusProject` handles). Resume PDF upload included.

Without `GITHUB_TOKEN`/`GITHUB_REPO`, the admin writes to the local working
tree instead — fully usable in dev. Admin writes are rate-limited (30/min)
as a runaway backstop.

Extra env for the admin: `GITHUB_TOKEN` (fine-grained PAT, this repo, Contents
RW), `GITHUB_REPO`, optional `GITHUB_BRANCH`, `VERCEL_TOKEN`,
`VERCEL_PROJECT_ID` (and `VERCEL_TEAM_ID` for team projects).

## Architecture

- **Single `zustand` store** (`src/lib/store.ts`) is the shared bus:
  `scrollProgress`, `activeSection`, `sceneCommand`. Sections never talk to each
  other directly — they go through the store.
- **Lenis is the only scroll source** (`src/lib/lenis.tsx`), driven by GSAP's
  ticker. A document-spanning ScrollTrigger writes `scrollProgress`; per-section
  triggers set `activeSection`. `useScrollTo()` is the one programmatic-scroll API.
- **The 3D canvas is lazy** (`next/dynamic`, `ssr: false`) and never blocks first
  paint — three.js lives in a separate chunk. It only _reads_ the store inside
  `useFrame`; it never owns scroll. A static poster is the SSR/hydration
  placeholder and the permanent fallback under reduced-motion / small touch
  devices (the 3D chunk isn't even fetched there).
- **AI drives the 3D**: chat tool calls become `sceneCommand` values (see below).
- **Content is data**: `src/content/{bio,projects,story,gallery}.ts`; blog is MDX
  in `src/content/posts`.
- **Every animation is gated** behind `prefers-reduced-motion` (GSAP
  `matchMedia`, `MotionConfig reducedMotion="user"`, a media-query 3D fallback,
  and a global CSS guard).

### Folder layout

```
src/
  app/             routes (App Router): /, /work/[slug], /blog, /blog/[slug],
                   /feed.xml, /api/chat, sitemap.ts, robots.ts, opengraph-image
  components/      ui, sections/, chat/, three/, mdx/
  lib/             store.ts, lenis.tsx, rate-limit.ts, site.ts, utils, hooks
  content/         bio.ts, projects.ts, story.ts, gallery.ts, posts/*.mdx
  mdx-components.tsx
public/images/     gallery/, projects/, story/   ·  public/models/
scripts/           gen-gallery-placeholders.mjs
```

## Adding content

- **A project** → add an entry to `src/content/projects.ts` with a **stable
  `id`** (the AI's `focusProject` handle) and a unique `slug`. A detail page and
  OG image are generated automatically. Drop a cover in `public/images/projects`.
- **A blog post** → create `src/content/posts/<slug>.mdx` exporting `metadata`
  (`title`, `date`, `description`, `tags`), then add one line to the registry in
  `src/content/posts.ts`. Reading time, RSS, sitemap, and OG update automatically.
- **A photo** → replace files in `public/images/gallery` (regenerate placeholders
  with `node scripts/gen-gallery-placeholders.mjs`) and update
  `src/content/gallery.ts`. Static imports give automatic blur-up.

## AI chat → scene commands

`src/app/api/chat/route.ts` streams Gemini and exposes three tools; the client
(`src/components/chat/ChatPanel.tsx`) intercepts the tool-call parts and dispatches:

| Tool                    | Effect                                                            |
| ----------------------- | ---------------------------------------------------------------- |
| `focusProject({ id })`  | `sceneCommand = { type: "focusProject", id }` → camera flies to the node (CameraRig) + scrolls to Work. |
| `navigateTo({ section })` | Smooth-scrolls to the section (camera follows scroll).         |
| `showResume()`          | Opens the resume.                                                |

The system prompt is grounded in `bio` + `projects` + blog titles — no vector DB.
Rate limiting uses Upstash when configured, else an in-memory per-instance
sliding window (clean 429).

## SEO & a11y

Per-route `metadata` + `generateMetadata`; dynamic OG images via `next/og`
(`opengraph-image` for the site, posts, and projects); `sitemap.ts`, `robots.ts`,
RSS (`/feed.xml`), and JSON-LD (`Person`, `BlogPosting`). Skip-to-content link,
semantic landmarks, focus-trapped chat, keyboard-navigable lightbox, and a full
reduced-motion story/3D fallback.

## Deploy to Vercel

1. Push to GitHub and import the repo in Vercel (framework auto-detected).
2. Set `GOOGLE_GENERATIVE_AI_API_KEY` (and optionally `AI_MODEL`, `NEXT_PUBLIC_SITE_URL`,
   and the Upstash vars) in Project → Settings → Environment Variables.
3. Deploy. Set `NEXT_PUBLIC_SITE_URL` to the production domain for correct
   absolute metadata/OG/sitemap URLs.

## Conventions

RSC by default, `"use client"` only where needed · secrets in env only ·
every animation has a reduced-motion fallback · keyboard-navigable, alt text
everywhere · conventional commits.
