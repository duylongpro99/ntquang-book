import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this app so Next doesn't infer the monorepo
  // root (the repo has sibling dirs like out/ and a future cms/).
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;
