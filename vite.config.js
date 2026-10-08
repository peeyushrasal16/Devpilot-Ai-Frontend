import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const proxyConfig = {
  target: 'http://localhost:8080',
  changeOrigin: true,
  secure: false,
  configure: (proxy) => {
    proxy.on('proxyReq', (proxyReq) => {
      // Remove browser Origin header so Spring Boot doesn't reject it due to backend CORS origin typo
      proxyReq.removeHeader('origin');
    });
  },
};

export default defineConfig({
  plugins: [react()],

  server: {
    port: 5174,
    proxy: {
      '/users': proxyConfig,
      '/auth': proxyConfig,
      '/projects': proxyConfig,
      '/project-members': proxyConfig,
      '/tasks': proxyConfig,
      '/bugs': proxyConfig,
      '/documentation': proxyConfig,
      '/task-assignments': proxyConfig,
      '/notifications': proxyConfig,
      '/activity-logs': proxyConfig,
      '/comments': proxyConfig,
      '/ai': proxyConfig,
    },
  },
})