/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Where the React app reads case data from:
   * "api" = the dev backend (/api/*), "static" = public/data/*.json.
   * Default: "api" in `npm run dev`, "static" in production builds.
   */
  readonly VITE_DATA_SOURCE?: "api" | "static";
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
