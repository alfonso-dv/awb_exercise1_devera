import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import checker from "vite-plugin-checker";

export default defineConfig({
  // Relative base so the built app works both at "/" (vite preview)
  // and under a sub-path like "/awb_exercise1_devera/" (GitHub Pages).
  base: "./",
  plugins: [
    // Compiles JSX/TSX (automatic JSX runtime) and enables React Fast Refresh
    // (HMR that keeps component state) in dev.
    react(),
    // Vite itself only strips types (no type checking). This runs `tsc` in a
    // worker during `npm run dev` and shows type errors in the terminal and as
    // a browser overlay. `npm run build` runs `tsc` explicitly instead.
    checker({ typescript: true, enableBuild: false })
  ],
  build: {
    // Two entry pages while the migration is in progress:
    //   index.html -> the working vanilla TypeScript app
    //   react.html -> the React version being built up view by view
    rolldownOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        react: resolve(import.meta.dirname, "react.html")
      }
    }
  }
});
