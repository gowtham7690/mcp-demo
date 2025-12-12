require('dotenv').config();


// string-tool.js — supports concat, upper, lower, length
const express = require('express');
const pino = require('pino');
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

const app = express();
app.use(express.json());

app.post('/run', (req, res) => {
  const msg = req.body || {};
  const input = msg.input || {};
  const { op, s1, s2 } = input;

  logger.info({ id: msg.id || null, tool: 'string-tool', input }, 'string-tool received request');

  try {
    if (!op) throw new Error('Missing op');
    let output;

    switch (op) {
      case 'concat':
        if (s1 === undefined || s2 === undefined) throw new Error('concat requires s1 and s2');
        output = { result: String(s1) + String(s2) };
        break;
      case 'upper':
        if (s1 === undefined) throw new Error('upper requires s1');
        output = { result: String(s1).toUpperCase() };
        break;
      case 'lower':
        if (s1 === undefined) throw new Error('lower requires s1');
        output = { result: String(s1).toLowerCase() };
        break;
      case 'length':
        if (s1 === undefined) throw new Error('length requires s1');
        output = { result: String(s1).length };
        break;
      default:
        throw new Error('Unsupported operation');
    }

    const okResp = { id: msg.id || null, tool: 'string-tool', ok: true, output };
    logger.info({ id: msg.id || null, output }, 'string-tool succeeded');
    return res.json(okResp);

  } catch (err) {
    const errResp = { id: msg.id || null, tool: 'string-tool', ok: false, error: err.message };
    logger.error({ err: err.message }, 'string-tool error');
    return res.status(400).json(errResp);
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok', tool: 'string-tool', time: new Date().toISOString() }));

const PORT = process.env.STRING_TOOL_PORT || 3002;
app.listen(PORT, () => logger.info({ port: PORT }, `string-tool listening on http://localhost:${PORT}/run`));
