import { defineConfig } from "vite";

export default defineConfig({
  define: {
    global: "globalThis", // for AWS SDK
  },
  server: {
    proxy: {
      "/api/ndov": "http://localhost:3000",
    },
  },
  resolve: {
    alias: {
      "./runtimeConfig": "./runtimeConfig.browser", // for AWS SDK
    },
  },
});
