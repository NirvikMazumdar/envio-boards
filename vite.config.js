import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Relative base so the build works under any path, incl. GitHub Pages
// project subpaths (username.github.io/envio-boards/).
export default defineConfig({
  base: "./",
  plugins: [react()],
});
