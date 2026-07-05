/** Quick connectivity check: lists the Kapruka MCP tools. Run with `npm run probe`. */
import { listMcpTools, callMcpTool } from './mcp.js'
import { extractProducts } from './mappers.js'

async function main() {
  const tools = await listMcpTools()
  console.log(`Connected. ${tools.length} tools:`)
  for (const t of tools) console.log(`  - ${t.name}`)

  console.log('\nSample search "roses":')
  const raw = await callMcpTool('kapruka_search_products', { q: 'roses', limit: 2, currency: 'USD' })
  const products = extractProducts(raw, 'USD')
  for (const p of products) console.log(`  • ${p.name} — ${p.priceText} (${p.cat ?? 'gift'})`)
  process.exit(0)
}

main().catch((err) => {
  console.error('Probe failed:', err)
  process.exit(1)
})
