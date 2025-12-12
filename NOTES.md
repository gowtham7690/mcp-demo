MCP defines a standard JSON envelope for agent → broker → tool communication.

Agents initiate requests specifying id, tool, and input.

Broker routes the request to the correct tool using a registry.

Tools receive MCP requests, compute output, and return MCP responses.

Both request and response carry the same id for correlation.

Tools should remain stateless; each call must be independent.

Metadata allows optional context (timeouts, auth, hints).

The broker wraps tool responses into a standard MCP response format.

Errors follow the same MCP structure with ok: false and error text.

MCP simplifies tool interoperability across different languages/platforms.

Adding new tools only requires updating the broker’s registry.

MCP is minimal by design but extensible for discovery, capabilities, streaming, and workflow control.