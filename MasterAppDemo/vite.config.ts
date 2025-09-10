import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "todo-app": path.resolve(__dirname, "../island/src"),
    },
  },
  server: { port: 5173 },
});