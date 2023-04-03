import { defineConfig } from "vite";

export default defineConfig({
  server: {
    proxy: {
      "/events": "http://localhost:3000",
    },
  },
});
