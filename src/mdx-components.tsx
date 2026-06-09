import type { MDXComponents } from "mdx/types";
import { Callout } from "@/components/mdx/callout";

/**
 * Global MDX component map (App Router convention; this file must live at the
 * src/ root). Base elements are styled by Tailwind `prose` on the post wrapper,
 * so we only add custom components available to every post here.
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    Callout,
  };
}
