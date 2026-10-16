import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import { mockApi } from "./mock/mock-api";

// Point API_PROXY at a real API to replace the in-memory mock with a proxy.
const apiProxy = process.env.API_PROXY;

export default defineConfig({
  plugins: [react(), tailwindcss(), ...(apiProxy ? [] : [mockApi()])],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: apiProxy ? { "/api": { target: apiProxy, changeOrigin: true } } : undefined,
  },
});
