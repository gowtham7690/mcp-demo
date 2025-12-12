# MCP Minimal Schema

## Request
{
  "id": string,
  "tool": string,
  "input": object,
  "metadata": object | optional
}

## Response
{
  "id": string,
  "tool": string,
  "ok": boolean,
  "response": object | null,
  "error": string | optional
}
