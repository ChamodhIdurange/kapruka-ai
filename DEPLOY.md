# Deploying to Vercel

This repo is a monorepo with two apps that deploy as **two separate Vercel
projects from the same GitHub repo**:

| Project | Root Directory | What it is |
|---|---|---|
| Frontend | `client` | Static Vite + React SPA |
| Backend  | `server` | Express API served as a Vercel serverless function |

The backend has been prepared for Vercel: `server/api/index.ts` exports the
Express app, `server/vercel.json` rewrites all traffic to it, and `app.listen()`
only runs locally (guarded by `if (!process.env.VERCEL)`).

---

## 0. Push to GitHub

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push
```
(Secrets are safe: `**/.env` is gitignored.)

---

## 1. Deploy the BACKEND first (you need its URL for the frontend)

1. Vercel dashboard → **Add New… → Project** → import this GitHub repo.
2. **Root Directory:** click *Edit* → select **`server`**.
3. **Framework Preset:** *Other*. Leave Build/Output commands as default (empty).
4. **Environment Variables** — add these (from your `server/.env`):

   | Name | Value |
   |---|---|
   | `GOOGLE_API_KEY` | your Google AI Studio key |
   | `GOOGLE_MODEL` | `gemini-2.5-flash` |
   | `GOOGLE_FALLBACK_MODEL` | `gemini-2.5-flash-lite` |
   | `GOOGLE_BASE_URL` | `https://generativelanguage.googleapis.com/v1beta/openai/` |
   | `KAPRUKA_MCP_URL` | `https://mcp.kapruka.com/mcp` |
   | `DEFAULT_CURRENCY` | `USD` |
   | `CLIENT_ORIGIN` | *(fill in after step 2 — the frontend URL)* |

5. **Deploy.** Note the resulting URL, e.g. `https://kapruka-server.vercel.app`.
6. Test it: open `https://kapruka-server.vercel.app/api/health` → should return
   `{"ok":true,...}`. Also try `…/api/categories`.

---

## 2. Deploy the FRONTEND

1. Vercel → **Add New… → Project** → import the **same** repo again.
2. **Root Directory:** **`client`**.
3. **Framework Preset:** *Vite* (auto-detected). Build `npm run build`, output `dist`.
4. **Environment Variable:**

   | Name | Value |
   |---|---|
   | `VITE_API_BASE` | your backend URL from step 1 (e.g. `https://kapruka-server.vercel.app`) |

   ⚠️ Vite inlines env vars **at build time**, so this must be set *before* the
   build. If you change it later, redeploy.
5. **Deploy.** Note the URL, e.g. `https://kapruka-client.vercel.app`.

---

## 3. Wire CORS back to the frontend

1. Go to the **backend** project → Settings → Environment Variables.
2. Set `CLIENT_ORIGIN` = your frontend URL (e.g. `https://kapruka-client.vercel.app`).
   (Comma-separate to allow several, e.g. add your custom domain.)
3. **Redeploy the backend** (Deployments → ⋯ → Redeploy) so the new env takes effect.

Open the frontend URL — chat, browse, and checkout should all work.

---

## Notes & limits

- **Serverless duration:** `server/vercel.json` sets `maxDuration: 60` (the Hobby
  cap). The chat's tool-loop normally finishes well under this; on the Pro plan
  you can raise it up to 300s.
- **Free Gemini quota still applies** — the primary→lite fallback keeps chat
  working when `gemini-2.5-flash` hits its daily cap.
- **Streaming (SSE):** the `/api/chat` response streams; Vercel Node functions
  support this out of the box.
- **Auto-deploys:** every `git push` to the connected branch redeploys both
  projects.

### Troubleshooting

- **Backend build fails resolving `../src/index.js`** — Vercel's Node builder
  resolves `.js` specifiers to the `.ts` sources. If it ever doesn't, set the
  backend project's Build Command to `npm run build` and change
  `server/api/index.ts` to `import app from '../dist/index.js'`.
- **CORS errors in the browser** — `CLIENT_ORIGIN` on the backend must exactly
  match the frontend origin (scheme + host, no trailing slash), then redeploy.
- **Chat says "not configured"** — `GOOGLE_API_KEY` missing on the *backend*
  project (env vars are per-project).
