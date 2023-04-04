import { defineConfig } from "vite";

export default defineConfig({
  server: {
    proxy: {
      "/api/ndov": "http://localhost:3000",
    },
  },
});
