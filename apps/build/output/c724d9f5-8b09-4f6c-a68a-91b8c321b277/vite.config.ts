import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    allowedHosts: [".ngrok-free.dev"],
    proxy: {
      "/auth": {
        target: "http://localhost:7003",
        changeOrigin: true,
      },
      "/user": {
        target: "http://localhost:7004",
        changeOrigin: true,
      },
      "/api/status": {
        target: "http://localhost:5001",
        changeOrigin: true,
      },
      "/api/upload": {
        target: "http://localhost:7002",
        changeOrigin: true,
      },
    },
  },
});
