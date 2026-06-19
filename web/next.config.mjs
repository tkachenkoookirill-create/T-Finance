/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";
// For GitHub Pages set NEXT_PUBLIC_BASE_PATH=/<repo-name> in the workflow.
const basePath = isProd && process.env.NEXT_PUBLIC_BASE_PATH ? process.env.NEXT_PUBLIC_BASE_PATH : "";

const nextConfig = {
  reactStrictMode: true,
  output: "export",
  images: { unoptimized: true },
  basePath,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
};
export default nextConfig;
