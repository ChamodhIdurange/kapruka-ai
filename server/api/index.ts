// Vercel serverless entry — serves the Express app (an Express app IS a
// (req, res) handler, so Vercel's Node runtime can invoke it directly).
// All routes are defined in src/index.ts; vercel.json rewrites everything here.
import app from '../src/index.js'

export default app
