#!/usr/bin/env bash
set -euo pipefail

# ensure concurrently is installed: npm i -D concurrently
echo "Starting demo (tool, string-tool, broker, agent)..."

npx concurrently \
  "TOOL_PORT=3001 node tool.js" \
  "STRING_TOOL_PORT=3002 node string-tool.js" \
  "BROKER_PORT=3000 node broker.js" \
  "sleep 1 && BROKER_URL=http://localhost:3000/mcp node agent.js" \
  --names "math-tool,string-tool,broker,agent" --kill-others
