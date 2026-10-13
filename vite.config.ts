import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
// @ts-ignore
import { handleFeedbackApi } from './server/feedbackMiddleware.js';

function feedbackPlugin(): Plugin {
  return {
    name: 'feedback-api-plugin',
    configureServer(server) {
      server.middlewares.use(handleFeedbackApi);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handleFeedbackApi);
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), feedbackPlugin()],
  server: {
    port: 5173,
    host: true,
    allowedHosts: true
  },
  preview: {
    port: 4173,
    host: true,
    allowedHosts: true
  }
});
