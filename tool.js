// tool.js — a minimal MCP-compatible math tool

const express = require('express');
const app = express();
app.use(express.json());

// POST /run expects an MCP-style message:
// { id, tool, input: { op, a, b } }
app.post('/run', (req, res) => {
  const msg = req.body || {};
  const input = msg.input || {};

  const { op, a, b } = input;

  // Basic validation
  if (!op || a === undefined || b === undefined) {
    return res.status(400).json({
      id: msg.id || null,
      tool: "math-tool",
      ok: false,
      error: "Invalid input. Expected { op, a, b }"
    });
  }

  let result;
  try {
    switch (op) {
      case "add": result = a + b; break;
      case "sub": result = a - b; break;
      case "mul": result = a * b; break;
      case "div": 
        if (b === 0) throw new Error("Division by zero");
        result = a / b; 
        break;
      default:
        throw new Error("Unsupported operation");
    }

    return res.json({
      id: msg.id || null,
      tool: "math-tool",
      ok: true,
      output: { result }
    });

  } catch (err) {
    return res.status(500).json({
      id: msg.id || null,
      tool: "math-tool",
      ok: false,
      error: err.message
    });
  }
});

const PORT = process.env.TOOL_PORT || 3001;
app.listen(PORT, () =>
  console.log(`math-tool ready at http://localhost:${PORT}/run`)
);
