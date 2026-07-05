# Kapruka AI Concierge (KAI)

A real, AI-driven shopping concierge for **Kapruka** (Sri Lanka's largest gift-delivery
service). The chat is powered by **Azure OpenAI (GPT‑5.2)** and grounded in live data
from the **Kapruka MCP server** (`https://mcp.kapruka.com/mcp`) — real products, images,
prices, delivery cities, guest checkout, and order tracking.

This is a small monorepo:

```
client/   React + Vite + TypeScript UI (the KAI concierge screen)
server/   Node + Express backend: MCP broker + Azure OpenAI agent loop
```

## How it works

```
 Browser (client)  ──HTTP/SSE──▶  server  ──tool calls──▶  Azure OpenAI (GPT‑5.2)
                                     │
                                     └──MCP (StreamableHTTP)──▶  Kapruka MCP server
```

- **Chat** (`POST /api/chat`, SSE): the server runs a GPT‑5.2 tool-calling loop. The
  model calls the Kapruka MCP tools (`search_products`, `get_product`,
  `list_categories`, `list_delivery_cities`, `check_delivery`, `track_order`) and the
  server streams text + rich product cards back to the UI.
- **Browse / delivery / tracking**: plain REST endpoints proxy the matching MCP tools
  (`/api/search`, `/api/categories`, `/api/delivery-cities`, `/api/check-delivery`,
  `/api/track`).
- **Checkout** (`POST /api/order`): the **only** path that places an order. It calls the
  `create_order` MCP tool (guest checkout → click‑to‑pay URL) and is fired solely from
  the review step on an explicit click. The chat agent is **never** given the
  order-placing tool, so it can't buy anything on its own.

## Prerequisites

- Node 18+
- An Azure OpenAI resource with a **GPT‑5.2 deployment** (for the chat agent).
  The MCP server is a public free tier and needs no credentials.

## Setup & run

**1. Server**

```bash
cd server
npm install
cp .env.example .env      # then fill in your Azure OpenAI values
npm run dev               # http://localhost:8787
```

`server/.env`:

```
PORT=8787
KAPRUKA_MCP_URL=https://mcp.kapruka.com/mcp
AZURE_OPENAI_ENDPOINT=https://<your-resource>.openai.azure.com
AZURE_OPENAI_API_KEY=<your-key>
AZURE_OPENAI_DEPLOYMENT=gpt-5.2          # your deployment name
AZURE_OPENAI_API_VERSION=2024-10-21
DEFAULT_CURRENCY=USD
```

Sanity-check the MCP connection (no Azure key needed):

```bash
npm run probe
```

**2. Client**

```bash
cd client
npm install
npm run dev               # http://localhost:5173
```

`client/.env` (already created): `VITE_API_BASE=http://localhost:8787`.

## Verify

- `curl localhost:8787/api/categories` → live Kapruka categories
- `curl "localhost:8787/api/search?q=roses&currency=USD"` → real products with images/prices
- `curl "localhost:8787/api/delivery-cities?query=colombo"` → real delivery cities
- In the UI: ask KAI *"red roses to Galle tomorrow"* → streamed reply with real product
  cards; add to basket; check out (city autocompletes from the live network, the rate
  comes from `check_delivery`); Place order returns a real pay link; paste a Kapruka
  order number into the basket panel to track it.

## Notes

- Chat requires valid Azure OpenAI credentials in `server/.env`; the REST/browse
  endpoints work without them.
- Prices are shown in the configured display currency (default USD). Kapruka adds the
  delivery charge (LKR) at payment.
- The original Claude Design handoff bundle is kept under `kapruka-handoff/` for reference.
```
