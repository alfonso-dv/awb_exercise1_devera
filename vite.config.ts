import { defineConfig } from "vite";
import checker from "vite-plugin-checker";

export default defineConfig({
  // Relative base so the built app works both at "/" (vite preview)
  // and under a sub-path like "/awb_exercise1_devera/" (GitHub Pages).
  base: "./",
  plugins: [
    // Vite itself only strips types (no type checking). This runs `tsc` in a
    // worker during `npm run dev` and shows type errors in the terminal and as
    // a browser overlay. `npm run build` runs `tsc` explicitly instead.
    checker({ typescript: true, enableBuild: false })
  ]
});
