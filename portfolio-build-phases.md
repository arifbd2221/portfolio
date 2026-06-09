# Portfolio build — phase-by-phase instructions for Claude Code

A personal portfolio site: AI-forward, animation-heavy, with a 3D centerpiece and a Claude-powered chat that can navigate the 3D scene. Premium, distinctive, fast.

**How to work:** Do the phases in order. Track them with your todo tool. Commit after each phase using the suggested message. **Stop after Phase 0 and show me the result before continuing.** From Phase 1 on, proceed autonomously, but pause and ask if a decision is ambiguous or you hit a blocker — don't guess.

---

## Before you start — the locked decisions

**Stack (use exactly this):** Next.js (App Router) + TypeScript strict · Tailwind v4 · `motion` (Framer Motion successor) · `gsap` (fully free, all plugins) · `lenis` · `three` + `@react-three/fiber` + `@react-three/drei` · `zustand` · Vercel AI SDK (`ai` + `@ai-sdk/anthropic` + `@ai-sdk/react`) · `@next/mdx` + `rehype-pretty-code` + `shiki` · `yet-another-react-lightbox`. Deploy to Vercel. Use pnpm if you have no reason not to.

**Architecture rules that don't bend:**
- A single `zustand` store is the shared bus: `scrollProgress`, `activeSection`, `sceneCommand`. Sections never talk to each other directly — they go through the store.
- **Lenis is the only scroll source.** Wire GSAP to it; never use `@react-three/drei`'s `ScrollControls` (it creates a competing scroll container).
- The R3F scene **reads** `scrollProgress` and `sceneCommand` inside `useFrame`. It does not own scroll.
- The 3D canvas is **lazy** (`next/dynamic`, `ssr: false`) and must never block first paint.
- **AI drives the 3D:** chat tool calls become `sceneCommand` values that move the camera.
- **Content is data:** bio, projects, story beats, gallery in typed files; blog in MDX. Scaffold with clearly-marked placeholders.

**Always:** RSC by default, `"use client"` only where needed · secrets in env, never hardcoded or committed · every animation gated behind `prefers-reduced-motion` · keyboard-navigable, alt text everywhere · conventional commits.

---

## Phase 0 — Scaffold & foundations

**Goal:** A running app with the structure, dependencies, and core primitives in place.

**Tasks**
- Initialize Next.js (App Router, TypeScript strict, ESLint, `src/` dir, import alias `@/*`).
- Install all stack dependencies above plus dev deps (`@next/bundle-analyzer`, types).
- Configure Tailwind v4 (CSS-first: `@import "tailwindcss"` in `globals.css`), add the typography plugin for the blog.
- Set up the folder structure:
  - `src/app` (routes), `src/components` (ui), `src/components/three` (3D), `src/components/chat` (AI chat)
  - `src/lib` (`store.ts`, `lenis.tsx`, helpers), `src/content` (`bio.ts`, `projects.ts`, `story.ts`, `gallery.ts`), `src/content/posts` (MDX)
  - `public/images`, `public/images/gallery`, `public/models`
- Dark mode via `next-themes` (system default).
- Root layout: `next/font` setup, default `metadata`, theme provider, the Lenis provider wrapper (mounted, wiring comes in Phase 1), a placeholder slot for the global chat launcher, and a placeholder mount point for the 3D canvas.
- `src/lib/store.ts`: the `zustand` store with `scrollProgress: number`, `activeSection: string`, `sceneCommand: SceneCommand | null`, and their setters. Define the `SceneCommand` type now.
- `.env.example` with `ANTHROPIC_API_KEY=`, `AI_MODEL=claude-sonnet-4-6`, and commented optional `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`. Ensure `.gitignore` covers `.env*.local`.
- `README.md`: setup steps, scripts, full env-var list.
- `git init`, first commit.

**Done when:** `pnpm dev` runs with no console errors, a placeholder homepage renders, the theme toggle works, and the store + Lenis provider are mounted.

**Commit:** `chore: scaffold next app, deps, store, lenis provider`

**→ STOP HERE. Show me the running scaffold and the folder layout before continuing.**

---

## Phase 1 — Motion bus (Lenis + GSAP + store)

**Goal:** One smooth-scroll source feeding both GSAP and the store, with reduced-motion handled globally.

**Tasks**
- In the Lenis provider: initialize Lenis once, `gsap.registerPlugin(ScrollTrigger)`, connect them — `lenis.on('scroll', ScrollTrigger.update)`, drive `lenis.raf` from `gsap.ticker.add(t => lenis.raf(t * 1000))`, and `gsap.ticker.lagSmoothing(0)`.
- Write `scrollProgress` (0→1 over the page) to the store from Lenis's scroll event.
- Build a reusable scroll-reveal primitive (`<Reveal>` or `useScrollReveal`) using ScrollTrigger.
- Per-section ScrollTriggers set `activeSection` in the store.
- Global reduced-motion guard via `gsap.matchMedia()` — when reduced motion is preferred, skip/instant-complete all reveals.
- Prove it: one section with a scroll-reveal plus a temporary on-screen readout of `scrollProgress` / `activeSection`.

**Watch for:** This is the foundation everything else rides on — get the Lenis↔GSAP sync exactly right here so later phases don't fight scroll.

**Done when:** Scrolling is smooth, an element reveals on scroll, the store values update live, and reduced-motion disables the animation. (Remove the debug readout before commit.)

**Commit:** `feat: lenis+gsap scroll bus wired to zustand store`

---

## Phase 2 — 3D centerpiece (R3F)

**Goal:** A lazy-loaded hero scene whose camera responds to scroll, with solid perf and fallbacks.

**Tasks**
- `src/components/three/Scene.tsx` holds the `<Canvas>` and scene contents (client component).
- Load it via `next/dynamic(() => import('./Scene'), { ssr: false, loading: () => <Loader /> })` from a wrapper, behind `<Suspense>`.
- Canvas config: `dpr={[1, 2]}`, sensible camera; add `<AdaptiveDpr pixelated />`, `<AdaptiveEvents />`, `<Preload all />`.
- Placeholder hero: start with simple/instanced geometry (e.g. an instanced particle field), **not** a heavy model. If you use a GLTF, load it Draco/meshopt-compressed via drei's loaders.
- In `useFrame`: read `scrollProgress` from the store and lerp the camera along a path. Also read `sceneCommand` and stub a `focusProject` branch that lerps the camera toward a target (the chat wires this in Phase 7); clear the command once reached.
- Render efficiency: use `frameloop="demand"` with `invalidate()` on scroll, or pause rendering when the canvas is offscreen.
- Fallbacks: a `<HeroFallback>` static poster image used when `prefers-reduced-motion` is set or on low-power/mobile devices.

**Watch for:** Confirm the three.js bundle is **not** in the initial JS payload. First paint must not wait on the canvas.

**Done when:** The hero renders, the camera moves with scroll, it loads lazily with a loader, and the reduced-motion/mobile fallback shows correctly.

**Commit:** `feat: lazy r3f hero with scroll-driven camera + fallbacks`

---

## Phase 3 — Content sections (Work, About, Contact)

**Goal:** The data-driven content sections, with stable project ids the AI will later target.

**Tasks**
- `src/content/bio.ts` (name, role, summary, links) and `src/content/projects.ts` — array of `{ id, title, slug, summary, tags, role, year, links, cover, body }`. **Export stable `id`s** — these are the handles for the AI's `focusProject(id)` tool.
- Work section: a project grid (motion hover states) → detail view at `/work/[slug]` (or an overlay). Detail shows the case study.
- About section: bio, portrait, skills.
- Contact: social links + an email CTA (`mailto:` for v1; wire a form service like Resend/Formspree later — do **not** build an insecure mailer).
- Hook each section's `activeSection` update via ScrollTrigger.

**Done when:** Work cards render from data and open details, About/Contact render from content, and project ids are exported and stable.

**Commit:** `feat: work, about, contact sections (data-driven)`

---

## Phase 4 — Story (scrollytelling)

**Goal:** A choreographed, scroll-told narrative section — the showpiece for the motion stack.

**Tasks**
- `src/content/story.ts`: ordered `beats: { id, image, kicker, heading, body }[]` with placeholder copy and placeholder images.
- Build the engine: a GSAP-pinned section where scroll progress within the pin drives a timeline — image crossfade/parallax + text in/out per beat. Use `next/image`; preload the next beat's image.
- Reduced-motion fallback: render the beats as a clean, stacked, readable sequence with no pinning or animation.
- Mobile: verify pinning behaves; if janky, fall back to the stacked variant on small screens.

**Watch for:** Mark all placeholder copy/images clearly — I'll swap in the real life-event content. Keep the beats data-driven so I never touch the engine.

**Done when:** Scrolling advances the beats with choreographed motion, it's fully data-driven, and the reduced-motion version reads cleanly.

**Commit:** `feat: scrollytelling story section (pinned, data-driven)`

---

## Phase 5 — Blog (MDX + Shiki + RSS) — the calm zone

**Goal:** A readable, first-party MDX blog that is deliberately quieter than the rest of the site.

**Tasks**
- Configure `@next/mdx` in `next.config` with `remark-gfm`, `rehype-slug`, and `rehype-pretty-code` (Shiki) — pick a Shiki theme that matches the site.
- Posts as MDX in `src/content/posts/*.mdx`, each exporting typed `metadata` (`title`, `date`, `description`, `tags`). Add a small util to import them for the index. Keep it native — no Contentlayer.
- `/blog` index: posts sorted by date, with reading time.
- Post layout — **calm zone:** restrained typography (Tailwind `prose`), the Shiki code styling, and at most a subtle fade-in. No 3D, minimal motion.
- RSS: generate `app/feed.xml/route.ts` from the post list.
- Per-post SEO metadata + OG.
- One sample post showing headings, a code block, an image, and a callout component.

**Done when:** `/blog` lists posts, a post renders with highlighted code and clean typography, the RSS feed validates, and the blog is visibly calmer than the rest of the site.

**Commit:** `feat: mdx blog with shiki highlighting and rss`

---

## Phase 6 — Gallery (curated handful)

**Goal:** A small, optimized photo gallery with a lightbox.

**Tasks**
- `src/content/gallery.ts`: array of `{ src, alt, width, height, caption? }` for a curated handful, with placeholder images in `public/images/gallery`.
- Responsive grid (tidy grid or CSS-column masonry) using `next/image` with `placeholder="blur"` (local imports) and lazy loading.
- Lightbox via `yet-another-react-lightbox` — keyboard nav, captions, and the zoom/thumbnails plugins.
- Subtle staggered entrance, gated by reduced-motion.
- Because it's a handful: static local images only — no pagination, no CDN.
- The Story section shares these photos — keep the gallery (or shared image ids) as the source of truth so they don't duplicate.

**Done when:** The grid renders the handful, clicking opens a keyboard-navigable lightbox, and images load with blur-up placeholders.

**Commit:** `feat: curated photo gallery with lightbox`

---

## Phase 7 — AI chat (Claude, streaming, drives the 3D)

**Goal:** A global chat that answers as the portfolio's guide and navigates the 3D scene via tools.

**Tasks**
- `src/app/api/chat/route.ts`: a route handler using `streamText` from `ai`, model from `@ai-sdk/anthropic` — `anthropic(process.env.AI_MODEL ?? 'claude-sonnet-4-6')`.
- System prompt assembled from `bio.ts` + `projects.ts` (+ blog titles): answer as Arif's portfolio guide, grounded, concise, on-topic, and gracefully declining what it doesn't know. **No vector DB / RAG — the whole bio fits in the prompt.**
- Tools (AI SDK `tools` with zod schemas):
  - `focusProject({ id })` — returns the project's display data; the client maps the call to `sceneCommand = { type: 'focusProject', id }` so the camera flies to that node and the UI scrolls to / opens it.
  - `showResume()` — surfaces the resume.
  - `navigateTo({ section })` — scrolls to a section.
- Client: a global floating chat launcher (`src/components/chat`) using `useChat` from `@ai-sdk/react`; stream the assistant text with a typing feel; intercept tool-call parts and dispatch them to the store.
- The R3F scene's `useFrame` consumes `sceneCommand`, lerps the camera to the focused node, and clears the command when reached.
- Rate limiting: use `@upstash/ratelimit` + `@upstash/redis` when env vars are present; otherwise an **in-memory sliding-window limiter** keyed by IP (comment that it's per-instance, for local/dev). Cap requests/min and max output tokens. Return a friendly 429 when exceeded.
- Read the key only from env; never log or expose it.

**Done when:** The chat opens on any page; "show me your X work" streams an answer **and** flies the camera to that project; "show me your resume" surfaces it; the rate limiter returns a clean 429 when tripped; and it runs locally without Upstash via the fallback.

**Commit:** `feat: claude chat that streams and drives the 3d scene`

---

## Phase 8 — Polish (SEO, a11y, performance)

**Goal:** Ship-ready.

**Tasks**
- SEO: per-route `metadata`, dynamic OG images via `next/og` `ImageResponse` (`opengraph-image`), `sitemap.ts`, `robots.ts`, and JSON-LD (`Person`, `BlogPosting`).
- Accessibility pass: keyboard nav end to end, focus trapping in the chat and lightbox, contrast, a full `prefers-reduced-motion` audit across every animated surface, alt-text completeness, semantic landmarks, and a skip-to-content link.
- Performance: confirm the 3D is code-split and lazy (`@next/bundle-analyzer`), run Lighthouse on mobile + desktop (target ~90+), verify images are sized/optimized, defer non-critical JS, and re-confirm first paint isn't blocked by the canvas. Verify the mobile 3D fallback.
- Final README: architecture overview, env vars, how to add a project / post / photo, how the AI tools map to scene commands, and Vercel deploy steps.

**Done when:** Lighthouse is healthy, no accessibility regressions, OG images render, sitemap/robots exist, and the README is complete.

**Commit:** `chore: seo, a11y, and performance polish` — then tag `v0.1.0`.

---

## Don't get these wrong
- One scroll source (Lenis). No drei `ScrollControls`.
- Never hardcode or commit secrets — `.env.local` + `.env.example` only.
- No vector DB / RAG for the chat — the bio goes in the system prompt.
- Keep the blog calm — readability beats motion.
- The 3D must never block first paint.
- Every animation has a `prefers-reduced-motion` fallback.
