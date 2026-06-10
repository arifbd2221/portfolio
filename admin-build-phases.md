# Admin panel — phase-by-phase plan

A private `/admin` area to control the portfolio and publish blog posts.

**Architecture: git-backed admin (recommended).** The site's core design is
"content is data in the repo, statically built" — typed content files + MDX →
SSG → Vercel. The admin keeps that intact: every save is a **commit to GitHub**
(via the GitHub API with a server-side token), and Vercel auto-deploys `main`.
The repo stays the single source of truth, content stays versioned (git history
is the audit log), the public site stays fully static and fast, and there is
**no database, no extra service, no new runtime cost**. The trade-off: a
publish takes ~1–2 min (build time) instead of being instant — the admin shows
deploy status so this feels predictable rather than broken.

**How to work:** Phases in order, tracked with the todo tool, commit after each
phase, conventional commits. Same rules as `portfolio-build-phases.md`: RSC by
default, secrets in env only, keyboard-navigable, every animation gated.

---

## Locked decisions (verified against current docs, June 2026)

- **Route guard:** Next 16 renamed `middleware.ts` → **`proxy.ts`** (Node
  runtime). Guard `/admin/:path*` + `/api/admin/:path*` there, **and**
  re-verify auth inside every admin route handler (the docs call proxy
  "optimistic" — defense in depth).
- **Auth:** Auth.js v5 (`next-auth@beta`) with the **GitHub OAuth provider**,
  allowlisted to exactly one account via the `signIn` callback
  (`profile.login === process.env.ADMIN_GITHUB_LOGIN`). `auth.ts` at src root,
  handlers at `app/api/auth/[...nextauth]/route.ts`, `await auth()` in server
  code, `export { auth as proxy }` integration. Fallback option if OAuth setup
  is unwanted: single-password login with `iron-session` (env-var hash) — same
  proxy guard, zero OAuth apps.
- **Committing:** plain `fetch` against the GitHub REST API (zero new deps;
  admin traffic doesn't need Octokit's retry machinery).
  - Single file: `PUT /repos/{owner}/{repo}/contents/{path}` — base64 content,
    `sha` required on update (**optimistic locking**; stale sha → 409 →
    surface "content changed elsewhere, reload").
  - Multi-file atomic (image + JSON together): Git Data API —
    `POST git/blobs` → `POST git/trees` (always set `base_tree`) →
    `POST git/commits` → `PATCH git/refs/heads/{branch}`.
  - Token: **fine-grained PAT**, single repo, **Contents: Read & write** only.
    Server env (`GITHUB_TOKEN`), never `NEXT_PUBLIC_*`, never logged.
- **Deploy status:** push to `main` auto-deploys on Vercel. Admin polls
  `GET https://api.vercel.com/v7/deployments?projectId=…&target=production&limit=1`
  (`VERCEL_TOKEN`) and shows QUEUED / BUILDING / READY / ERROR after each save.
  Optional — ship without it; add when tokens are set.
- **Posts auto-discovery** (prerequisite refactor): drop the hand-maintained
  registry. `generateStaticParams` from `fs.readdirSync(src/content/posts)`;
  load via `await import(`./../../content/posts/${slug}.mdx`)` **written
  directly in the page files** (template-literal context modules are the
  documented Next 16 pattern; the `@/` alias inside shared lib files is the
  known-flaky case — use relative paths in pages, smoke-test, and if Turbopack
  misbehaves fall back to a codegen `posts.generated.ts` prebuild script:
  identical pipeline, zero bundler risk).
- **Structured content → JSON + zod:** `projects.json`, `bio.json`,
  `story.json`, `gallery.json` in `src/content/`, each parsed by a typed zod
  loader (`src/content/loaders.ts`) so the site keeps full type safety and the
  admin can read/write plain JSON. Public components keep importing the same
  named exports — only the backing store changes.
- **Images without static imports:** gallery/story/cover images get
  `width`/`height`/`blurDataURL` **computed in the admin at upload time**
  (canvas downscale → tiny base64) and stored in the JSON. Same blur-up UX as
  today's static imports, but fully data-driven. Client-side resize to sane max
  dimensions (~2000px) + EXIF strip before commit.
- **Drafts:** `draft: true` in post metadata → excluded from index, RSS,
  sitemap, and the chat prompt; visible in the admin. Live preview renders in
  the editor (client-compiled MDX), not on the public site.
- **Outstatic (evaluated, rejected):** maintained and Next-16-compatible, but
  document-shaped only — flat frontmatter fields, no nested objects/arrays, so
  the gallery (width/height/blur per image) and projects can't be modeled; it
  also bypasses `@next/mdx` (runtime string compilation) and its TipTap editor
  risks mangling hand-authored MDX/JSX. A hand-rolled panel fits this repo.
- **When a database would be right instead:** instant publish (no build wait),
  multiple editors/roles, comments, or content too large for SSG. None apply
  today; the git-backed design doesn't block migrating later.

---

## New environment variables

| Variable             | Required | Purpose                                            |
| -------------------- | -------- | -------------------------------------------------- |
| `AUTH_SECRET`        | yes      | Auth.js session encryption (`npx auth secret`).    |
| `AUTH_GITHUB_ID`     | yes      | GitHub OAuth app client id.                        |
| `AUTH_GITHUB_SECRET` | yes      | GitHub OAuth app client secret.                    |
| `ADMIN_GITHUB_LOGIN` | yes      | The one GitHub username allowed into `/admin`.     |
| `GITHUB_TOKEN`       | yes      | Fine-grained PAT, this repo only, Contents: write. |
| `GITHUB_REPO`        | yes      | `owner/name`, e.g. `arifbd2221/portfolio`.         |
| `GITHUB_BRANCH`      | optional | Defaults to `main`.                                |
| `VERCEL_TOKEN`       | optional | Deploy-status polling.                             |
| `VERCEL_PROJECT_ID`  | optional | Deploy-status polling.                             |

GitHub OAuth app callback: `https://<domain>/api/auth/callback/github`
(+ `http://localhost:3000/api/auth/callback/github` for dev).

---

## Phase A0 — Auth + admin shell

**Goal:** A protected, empty `/admin` that only the owner can open.

- Install `next-auth@beta`. `src/auth.ts` (GitHub provider + `signIn`
  allowlist), `app/api/auth/[...nextauth]/route.ts`, `proxy.ts` with the
  matcher, sign-in/sign-out UI.
- `app/admin/layout.tsx`: server component that `await auth()`s (404 or
  redirect when unauthenticated — don't rely on proxy alone), minimal admin
  chrome (nav: Posts, Projects, Bio, Story, Gallery, Settings), `metadata.robots: noindex`.
- `robots.ts`: disallow `/admin`. Exclude admin from sitemap (already absent).
- `.env.example` + README env-table updates.

**Done when:** signed-out users never see `/admin` (proxy redirect + layout
guard), the allowlisted account signs in and sees the shell, any other GitHub
account is denied.
**Commit:** `feat(admin): auth.js github auth + protected admin shell`

## Phase A1 — Content layer refactor (the enabler; site must not change)

**Goal:** All content becomes admin-writable data with zero visual regression.

- Posts: auto-discovery (decision above); delete the manual registry; keep
  `readingTime`, sorting, types. Add `draft` to post metadata + filter
  everywhere (index, RSS, sitemap, chat prompt).
- `projects/bio/story/gallery` → JSON + zod loaders; gallery/story/cover images
  move to metadata-driven `next/image` (width/height/blurDataURL from JSON —
  one-time script backfills blur for the current demo images).
- A `src/lib/github.ts` commit service: `getFile`, `putFile` (sha round-trip),
  `commitFiles` (multi-file via Git Data API) — server-only, typed, no deps.
- Regression check: build + diff key pages' HTML before/after (allow hash-only
  churn); Lighthouse spot-check.

**Done when:** site renders identically from the new content layer; the commit
service can round-trip a file in a scratch path.
**Commit:** `refactor(content): json+zod content layer, auto-discovered posts, github commit service`

## Phase A2 — Blog admin (the MVP payoff)

**Goal:** Write, edit, and publish posts from the browser.

- `/admin/posts`: list (title/date/draft/reading-time) from the repo via the
  GitHub API (or local fs in dev).
- `/admin/posts/new` + `/admin/posts/[slug]`: frontmatter form (title, date,
  description, tags, draft) + **CodeMirror 6** markdown editor (lazy-loaded,
  admin chunk only) + side-by-side client-compiled MDX preview (prose styles +
  `Callout`; code blocks styled plainly in-preview — Shiki fidelity lands on
  deploy).
- Save = commit `src/content/posts/<slug>.mdx` (PUT + sha). Slug from title,
  immutable after creation (rename = explicit copy+delete commit). Delete with
  confirm.
- Deploy-status pill after save (when Vercel env present): committed →
  building → live.

**Done when:** a post written in the admin appears on `/blog` after the deploy
completes; drafts stay hidden; concurrent-edit conflict shows a clean 409
message instead of overwriting.
**Commit:** `feat(admin): blog editor with mdx preview, drafts, git publishing`

## Phase A3 — Media library

**Goal:** Images uploadable from the admin, optimized at the source.

- `/admin/media`: grid of `public/images/**` (GitHub trees API), upload with
  client-side resize/EXIF-strip + width/height/blurDataURL extraction,
  multi-file commit. Copy-path button; picker component reused by the other
  editors. Guard rails: extension/mime allowlist, size cap (~4 MB post-resize).

**Done when:** an uploaded image is committed, deployable, and insertable into
a post by path.
**Commit:** `feat(admin): media library with optimized git-committed uploads`

## Phase A4 — Structured content editors

**Goal:** Everything else on the site is editable.

- `/admin/projects`: CRUD on `projects.json`; **id immutable** (the AI's
  `focusProject` handle + 3D nodes — show a warning, never auto-edit ids);
  cover via media picker; live zod validation; reorder.
- `/admin/bio`: bio/skills/socials/resume form (resume PDF via media flow →
  `public/resume.pdf`).
- `/admin/story`: beats CRUD + drag-reorder + image picker.
- `/admin/gallery`: add/remove/reorder, **alt text required** (a11y), captions.
- Each save = one semantic commit (`content(projects): …`) so history reads well.

**Done when:** every public surface (work grid, about, story, gallery, chat
grounding) can be changed end-to-end from the admin.
**Commit:** `feat(admin): structured editors for projects, bio, story, gallery`

## Phase A5 — Hardening & polish

**Goal:** Boring-reliable.

- Rate-limit admin APIs (reuse `rate-limit.ts`), audit every `/api/admin/*`
  handler re-checks `auth()`, confirm `GITHUB_TOKEN` never reaches any client
  bundle (`ANALYZE=true` + grep dist), error toasts for 401/409/422/5xx,
  optimistic-UI with rollback, optional full-Shiki preview (lazy wasm),
  a11y pass over the admin (focus, labels, contrast), README "Admin" section.
- Optional nice-to-have: commit messages include the admin page that made the
  change; "view diff on GitHub" link after each save.

**Done when:** an afternoon of real editing produces zero surprises.
**Commit:** `chore(admin): hardening, a11y, docs` — then tag `v0.2.0`.

---

## Don't get these wrong

- Proxy is not enough — **every** admin route handler re-checks `auth()`.
- The PAT stays server-side; one repo; Contents-only. Rotate if ever unsure.
- Project **ids are immutable** — the AI tools and 3D scene depend on them.
- Always round-trip the file `sha` — silent last-write-wins is unacceptable.
- Drafts must be excluded from index, RSS, sitemap, **and the chat prompt**.
- The public site stays static — the admin must add zero weight to it
  (admin code lives in its own route group / chunks).
