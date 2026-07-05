# Deep Agents Documentation

This folder collects project-specific notes for evaluating LangChain Deep Agents from this Angular and TypeScript backend test app.

Use these pages as a working map while the implementation evolves. Keep notes practical, tied to this repository, and updated when SDK APIs or architecture decisions change.

## Pages

- [Backends](./backends.md)
- [Deep Agents Usage Notes](./deep-agents-usage-notes.md)
- [Tools Introduction](./tools/introduction.md)
- [Built-In Tools](./tools/built-in-tools/README.md)
- [MCP Tools](./tools/mcp-tools.md)

## Documentation Rules

- Treat the Node backend as the Deep Agents runtime boundary.
- Keep model credentials, filesystem access, and privileged tools out of Angular browser code.
- Verify current LangChain, LangGraph, and Deep Agents TypeScript APIs before documenting import paths, method names, event names, or stream shapes.
- Prefer small focused notes over large essays.
- Link back to implementation files when a note describes behavior that already exists in the app.
