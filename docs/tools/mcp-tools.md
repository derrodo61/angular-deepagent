# MCP Tools

MCP means Model Context Protocol.

Plain language: MCP is a standard way for an application to expose tools to an AI agent.

Instead of hard-coding every tool directly into the agent application, a separate MCP server can publish tools. An MCP client connects to that server, reads the tool definitions, and lets the agent call those tools.

Official docs:

- [Deep Agents customization: MCP tools](https://docs.langchain.com/oss/javascript/deepagents/customization#mcp-tools)
- [LangChain MCP guide](https://docs.langchain.com/oss/javascript/langchain/mcp)

## What Problem MCP Solves

Without MCP, every integration has to be wired directly into the agent app.

For example, if an agent should work with a database, a file system, an issue tracker, or another internal service, the app usually has to define those tools itself.

MCP adds a shared protocol between the agent app and tool providers:

```text
Deep Agent app
  -> MCP client
  -> MCP server
  -> tools exposed by that server
```

This means a tool provider can be built once and reused by different agent apps.

## The Main Parts

An `MCP server` provides tools. It might expose tools for a database, an API, a file system, or another service.

An `MCP client` connects to one or more MCP servers and loads their tool definitions.

An `MCP tool` is a tool described by an MCP server. It has a name, description, input schema, and execution behavior.

`@langchain/mcp-adapters` converts MCP tools into LangChain tools.

Deep Agents can receive those converted tools through the normal `tools` option.

## How MCP Tools Become Deep Agent Tools

The customization page shows this shape:

```ts
import { MultiServerMCPClient } from '@langchain/mcp-adapters';
import { createDeepAgent } from 'deepagents';

const client = new MultiServerMCPClient({
  my_server: {
    transport: 'http',
    url: 'http://localhost:8000/mcp',
  },
});

const tools = await client.getTools();

const agent = await createDeepAgent({
  model: 'openai:gpt-5.5',
  tools,
});
```

The important line is:

```ts
const tools = await client.getTools();
```

That line asks the MCP server which tools it exposes. The adapter returns LangChain-compatible tools. From that point on, the Deep Agent receives them like any other tools.

## What The Example Does Not Provide

The customization page example is a connection pattern. It is not a complete working experiment by itself.

It assumes there is already an MCP server running at:

```text
http://localhost:8000/mcp
```

It does not define:

- how to start the MCP server
- what tools the server exposes
- what those tools do
- how authentication works
- how errors are handled
- how the MCP client should be closed or cleaned up

So the example explains how MCP tools enter a Deep Agent, but not what concrete MCP server to use.

## Why This Matters

MCP keeps the agent application separate from tool-provider implementation.

That separation is useful when:

- tools are owned by another team or service
- several agent apps should use the same tools
- the tool server needs its own authentication or deployment
- tools should be discovered dynamically from a server
- the agent app should stay small while tool integrations grow

For this project, MCP should stay on the backend side. The Angular browser app should not hold credentials or connect directly to privileged MCP servers.
