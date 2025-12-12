// broker.js — minimal MCP broker (Agent -> Broker -> Tool -> Broker -> Agent)
//
// Usage:
//   1) Ensure your tool (math-tool) is running (see tool.js).
//   2) Run: BROKER_PORT=3000 node broker.js
//
// The broker expects POST /mcp with a JSON MCP request:
// { id, tool, input, metadata? }

const express = require('express');
const app = express();
app.use(express.json());

// Use global fetch if available (Node 18+). Otherwise try node-fetch.
let fetchFn;
try {
  // In Node 18+ global fetch exists
  if (typeof fetch === 'function') {
    fetchFn = fetch;
  } else {
    // eslint-disable-next-line global-require
    fetchFn = require('node-fetch');
  }
} catch (err) {
  // Fallback to requiring node-fetch
  fetchFn = require('node-fetch');
}

// Simple registry: map tool name -> tool endpoint URL
// You can override via env (e.g. MATH_TOOL_URL)
const registry = {
  'math-tool': process.env.MATH_TOOL_URL || 'http://localhost:3001/run',
  // Add more tools here, e.g. 'string-tool': 'http://localhost:3002/run'
};

// Health endpoint
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// MCP endpoint
app.post('/mcp', async (req, res) => {
  const msg = req.body || {};
  const { id = null, tool } = msg;

  if (!tool) {
    return res.status(400).json({ id, ok: false, error: 'Missing "tool" field in MCP request' });
  }

  const toolUrl = registry[tool];
  if (!toolUrl) {
    return res.status(404).json({ id, ok: false, error: `Tool "${tool}" not registered in broker` });
  }

  try {
    // Forward original MCP message to tool endpoint
    const r = await fetchFn(toolUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msg),
      // Optionally you can set a timeout in more advanced setups
    });

    // Try to parse JSON from tool
    let toolResp;
    try {
      toolResp = await r.json();
    } catch (parseErr) {
      // Tool returned non-JSON - treat as error
      const text = await r.text().catch(() => '<unreadable response>');
      return res.status(502).json({
        id,
        tool,
        ok: false,
        error: 'Tool returned invalid/non-JSON response',
        toolRaw: text
      });
    }

    // Build MCP response envelope
    const mcpResponse = {
      id,
      tool,
      ok: toolResp && toolResp.ok === true,
      response: toolResp
    };

    return res.json(mcpResponse);

  } catch (err) {
    return res.status(500).json({
      id,
      tool,
      ok: false,
      error: `Broker error forwarding to tool: ${err.message}`
    });
  }
});

const PORT = process.env.BROKER_PORT || 3000;
app.listen(PORT, () => {
  console.log(`MCP broker listening on http://localhost:${PORT}/mcp`);
  console.log('Registry:', registry);
});
