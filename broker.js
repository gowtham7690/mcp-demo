require('dotenv').config();


// broker.js — MCP broker with pino and AbortController timeout
const express = require('express');
const pino = require('pino');
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const app = express();
app.use(express.json());

let fetchFn;
try {
  if (typeof fetch === 'function') fetchFn = fetch;
  else fetchFn = require('node-fetch');
} catch (e) {
  fetchFn = require('node-fetch');
}

// Registry: map tool name -> endpoint
const registry = {
  'math-tool': process.env.MATH_TOOL_URL || 'http://localhost:3001/run',
  'string-tool': process.env.STRING_TOOL_URL || 'http://localhost:3002/run'
};

app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString(), registry }));

app.post('/mcp', async (req, res) => {
  const msg = req.body || {};
  const { id = null, tool } = msg;
  logger.info({ id, tool }, 'Broker received MCP request');

  if (!tool) {
    logger.warn({ id }, 'Missing tool field');
    return res.status(400).json({ id, ok: false, error: 'Missing "tool" field in MCP request' });
  }

  const toolUrl = registry[tool];
  if (!toolUrl) {
    logger.warn({ id, tool }, 'Tool not registered');
    return res.status(404).json({ id, ok: false, error: `Tool "${tool}" not registered in broker` });
  }

  try {
    // AbortController for timeout
    const AbortController = global.AbortController || (await import('abort-controller')).default;
    const controller = new AbortController();
    const timeoutMs = Number(process.env.BROKER_TOOL_TIMEOUT_MS || 3000);
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const r = await fetchFn(toolUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msg),
      signal: controller.signal
    });

    clearTimeout(timeout);

    let toolResp;
    try {
      toolResp = await r.json();
    } catch (parseErr) {
      const text = await r.text().catch(() => '<unreadable>');
      logger.error({ id, tool }, 'Tool returned non-JSON');
      return res.status(502).json({ id, tool, ok: false, error: 'Tool returned invalid/non-JSON response', toolRaw: text });
    }

    const mcpResponse = { id, tool, ok: toolResp && toolResp.ok === true, response: toolResp };
    logger.info({ id, tool, ok: mcpResponse.ok }, 'Broker responding');
    return res.json(mcpResponse);

  } catch (err) {
    const errMsg = err.name === 'AbortError' ? 'Tool request timed out' : err.message;
    logger.error({ id, tool, err: errMsg }, 'Broker error');
    return res.status(500).json({ id, tool, ok: false, error: `Broker error forwarding to tool: ${errMsg}` });
  }
});

const PORT = process.env.BROKER_PORT || 3000;
app.listen(PORT, () => logger.info({ port: PORT, registry }, `MCP broker listening on http://localhost:${PORT}/mcp`));
