// agent.js — interactive agent that sends multiple MCP requests to the broker
// Run: node agent.js


const fetch = (() => {
try {
// Node 18+ has global fetch
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
{ id: 'req-sub-1', tool: 'math-tool', input: { op: 'sub', a: 20, b: 3 } },
{ id: 'req-mul-1', tool: 'math-tool', input: { op: 'mul', a: 7, b: 6 } },
{ id: 'req-div-1', tool: 'math-tool', input: { op: 'div', a: 14, b: 2 } },
{ id: 'req-err-1', tool: 'math-tool', input: { op: 'pow', a: 2, b: 3 } },
];


for (const req of requests) {
console.log('→ Sending:', JSON.stringify(req));
const res = await sendRequest(req);
console.log('← Received:', JSON.stringify(res, null, 2));
}


console.log('Agent finished.');
}


main();