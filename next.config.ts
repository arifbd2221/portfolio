import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  // Allow .md/.mdx alongside .ts/.tsx (MDX posts are imported, not routed).
  pageExtensions: ["ts", "tsx", "md", "mdx"],
};

// NOTE: Next 16 builds with Turbopack by default, which requires remark/rehype
// plugins as serializable [name, options] tuples — NOT imported functions.
const withMDX = createMDX({
  options: {
    remarkPlugins: [["remark-gfm", {}]],
    rehypePlugins: [
      ["rehype-slug", {}],
      ["rehype-pretty-code", { theme: "github-dark-dimmed", keepBackground: true }],
    ],
  },
});

export default withMDX(nextConfig);
