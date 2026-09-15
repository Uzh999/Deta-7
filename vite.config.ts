import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // MapLibre is loaded as its own lazy chunk by the Location section, so the
    // default 500 kB warning only fires for that expected chunk.
    chunkSizeWarningLimit: 1200,
  },
});
