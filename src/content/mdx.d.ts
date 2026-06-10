// Ambient types for importing .mdx files as modules (default component + the
// `metadata` ESM export each post declares).
declare module "*.mdx" {
  import type { ComponentType } from "react";

  export const metadata: {
    title: string;
    date: string;
    description: string;
    tags: string[];
    draft?: boolean;
  };

  const MDXComponent: ComponentType;
  export default MDXComponent;
}
