import type { ReactNode } from "react";

/**
 * Blog = the calm zone. This opaque, raised wrapper sits above the fixed -z-10
 * 3D background so it's hidden here — no canvas behind the writing.
 */
export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative z-0 min-h-[calc(100dvh-65px)] bg-background">
      {children}
    </div>
  );
}
