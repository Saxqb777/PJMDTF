import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // `pg` is only reached when DATABASE_URL points at a plain Postgres, which
  // happens during local development and the tests. Keeping it external stops
  // it being bundled into the production serverless functions.
  serverExternalPackages: ["pg"],
};

export default nextConfig;
