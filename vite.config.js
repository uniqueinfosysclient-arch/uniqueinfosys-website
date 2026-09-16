import { existsSync } from 'node:fs';
import path from 'node:path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// ------------------------------------------------------------
// apiDevServer — serves the /api/*.js Vercel functions during
// `npm run dev`.
//
// In production Vercel runs everything in api/ as serverless
// functions, but the Vite dev server knows nothing about them, so
// without this the form would 404 locally while working fine once
// deployed. This middleware loads the handler through Vite (so it
// hot-reloads on edit) and shims the two Vercel response helpers
// the handlers use, res.status() and res.json().
//
// Dev only — never part of the production build.
// ------------------------------------------------------------
function apiDevServer(mode) {
  return {
    name: 'api-dev-server',
    apply: 'serve',
    configureServer(server) {
      // Vite only exposes VITE_-prefixed vars to the client. The API
      // handlers read unprefixed server-side vars off process.env, so
      // load the full .env into process.env for the dev process.
      const env = loadEnv(mode, process.cwd(), '');
      for (const [key, value] of Object.entries(env)) {
        if (process.env[key] === undefined) process.env[key] = value;
      }

      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) return next();

        const route = req.url.split('?')[0].replace(/\/+$/, '');
        const file = path.join(process.cwd(), `${route}.js`);
        if (!file.startsWith(path.join(process.cwd(), 'api')) || !existsSync(file)) return next();

        // Vercel's Node handlers expect these; node's ServerResponse has neither.
        res.status = (code) => { res.statusCode = code; return res; };
        res.json = (data) => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
          return res;
        };

        try {
          const mod = await server.ssrLoadModule(file);
          await mod.default(req, res);
        } catch (err) {
          server.config.logger.error(`[api] ${route} failed: ${err?.stack || err}`);
          if (!res.headersSent) res.status(500).json({ ok: false, error: 'Dev API handler failed — see terminal.' });
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), apiDevServer(mode)],
}));
