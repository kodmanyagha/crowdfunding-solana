import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    // Bug solution: https://github.com/coral-xyz/anchor/issues/1264#issuecomment-1189885921
    "process.env.ANCHOR_BROWSER": true,
  },
  plugins: [react()],
});
