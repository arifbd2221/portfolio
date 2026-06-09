/**
 * Static poster shown instead of the 3D scene under prefers-reduced-motion or
 * on small/low-power touch devices. No canvas, no animation, no three.js — it
 * must never trigger the lazy Scene chunk.
 *
 * PLACEHOLDER: a soft accent-tinted backdrop evoking the particle field. Swap
 * for a real rendered poster image later if desired.
 */
export function HeroFallback() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute left-1/2 top-1/3 size-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/20 blur-3xl" />
      <div className="absolute right-[15%] top-2/3 size-[40vmin] rounded-full bg-accent/10 blur-3xl" />
      <div className="absolute left-[10%] top-[15%] size-[30vmin] rounded-full bg-foreground/5 blur-3xl" />
    </div>
  );
}
