import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import electron from "vite-plugin-electron";
import electronRenderer from "vite-plugin-electron-renderer";

export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        entry: "electron/main.js",
        vite: {
          build: {
            outDir: "dist-electron",
          },
        },
      },
    ]),
    electronRenderer(),
  ],
  server: {
    port: 5173,
  },
  build: {
    outDir: "dist",
  },
});
