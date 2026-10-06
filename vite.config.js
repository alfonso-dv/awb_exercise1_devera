import { defineConfig } from "vite";

export default defineConfig({
  // Relative base so the built app works both at "/" (vite preview)
  // and under a sub-path like "/awb_exercise1_devera/" (GitHub Pages).
  base: "./"
});
