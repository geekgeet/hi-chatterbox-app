import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
const wsTokenFix: Plugin = {
  name: 'ws-token-fix',
  enforce: 'post',
  transform(code) {
    if (code.includes('__WS_TOKEN__')) {
      return code.replace(/__WS_TOKEN__/g, JSON.stringify(''));
    }
    return null;
  },
};
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    wsTokenFix,
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    __WS_TOKEN__: JSON.stringify(""),
  },
}));