import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turbopack walks up looking for a lockfile, finds a stray one in the Windows
  // home directory and infers that as the workspace root, warning on every dev
  // start and build. Pinning the root to this file's own directory is the fix
  // the warning recommends, and it does not depend on the state of anything
  // outside the project.
  turbopack: {
    root: dirname(fileURLToPath(import.meta.url)),
  },
};

export default nextConfig;
