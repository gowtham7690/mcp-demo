// agent.js — demo agent that calls both math-tool and string-tool
const fetch = (() => {
  try {
    if (typeof fetch === 'function') return fetch;
    return require('node-fetch');
  } catch (e) {
    return require('node-fetch');
  }
})();

const BROKER_URL = process.env.BROKER_URL || 'http://localhost:3000/mcp';

async function sendRequest(req) {
  try {
    const r = await fetch(BROKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    const json = await r.json();
    return json;
  } catch (err) {
    return { id: req.id || null, ok: false, error: err.message };
  }
}

async function main() {
  console.log('Agent -> Broker URL:', BROKER_URL);

  const requests = [
    { id: 'req-add-1', tool: 'math-tool', input: { op: 'add', a: 10, b: 5 } },
    { id: 'req-upper-1', tool: 'string-tool', input: { op: 'upper', s1: 'hello world' } },
    { id: 'req-concat-1', tool: 'string-tool', input: { op: 'concat', s1: 'foo', s2: 'bar' } },
    { id: 'req-len-1', tool: 'string-tool', input: { op: 'length', s1: 'abcdef' } },
    { id: 'req-div-1', tool: 'math-tool', input: { op: 'div', a: 14, b: 2 } },
  ];

  for (const req of requests) {
    console.log('\n→ Sending:', JSON.stringify(req));
    const res = await sendRequest(req);
    console.log('← Received:', JSON.stringify(res, null, 2));
  }

  console.log('\nAgent finished.');
}

main();
