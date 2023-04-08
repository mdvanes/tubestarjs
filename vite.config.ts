import { defineConfig } from "vite";

export default defineConfig({
  define: {
    // Global needed for Amplify
    global: {},
  },
  server: {
    proxy: {
      "/api/ndov": "http://localhost:3000",
    },
  },
});
