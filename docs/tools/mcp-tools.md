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

## Where The Tool Runs

The MCP adapter creates a local LangChain tool wrapper in the Deep Agent app.

That wrapper is not the full tool implementation. It is more like a proxy.

When the agent calls the tool, the wrapper sends the tool call to the MCP server. The MCP server executes the real tool and sends the result back.

```text
Agent calls tool
  -> local LangChain wrapper
  -> MCP server
  -> real tool execution
  -> result returned to agent
```

This means the MCP server must still be running and reachable when the tool is called.

## Cost And Ownership

Because the real tool runs on the MCP server, the MCP server provider pays for the tool execution environment.

That can include:

- server compute
- database queries
- API calls
- storage access
- network traffic
- authentication and rate-limit infrastructure

The Deep Agent app still has its own costs:

- model tokens for seeing tool definitions
- model tokens for deciding when to call tools
- model tokens for reading tool results
- agent orchestration
- MCP client connection overhead

So MCP moves the external tool execution to the MCP server side, but it does not remove model or agent-runtime costs from the Deep Agent app.

If we connect to a third-party MCP server, that provider owns the tool execution environment and may require authentication, rate limits, or billing. If we run the MCP server ourselves, we pay both sides.

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

## Selecting Tools

`client.getTools()` can return every tool exposed by the connected MCP server.

If the MCP server exposes 20 tools, then `getTools()` may return 20 tools. If all 20 are passed to `createDeepAgent`, the agent can see and choose from all 20.

That is not always what we want.

Too many tools can make the agent's choice harder. Some tools may be irrelevant for the current agent. Some tools may be privileged or risky. Tool names, descriptions, and schemas also take up context.

For a real app, it is often better to select only the tools this agent actually needs:

```ts
const allTools = await client.getTools();

const tools = allTools.filter((tool) => ['search_docs', 'read_ticket'].includes(tool.name));

const agent = await createDeepAgent({
  model,
  tools,
});
```

Plain language:

```text
MCP server exposes many tools
  -> MCP client loads them
  -> app selects the relevant tools
  -> Deep Agent receives only those selected tools
```

Passing every MCP tool can be fine when the MCP server is already narrow and built for this one agent. Otherwise, filtering keeps the agent smaller, clearer, and safer.

## Authentication

Some MCP servers can be used without authentication. Others require credentials.

For example, Notion's hosted MCP server uses OAuth. In practical terms, this means our backend cannot simply connect to Notion MCP with a static URL and immediately use the tools. The app would need an OAuth flow:

```text
user clicks Connect Notion
  -> backend creates an authorization URL
  -> user authorizes in the browser
  -> Notion redirects back to a backend callback route
  -> backend exchanges the code for tokens
  -> backend stores tokens safely
  -> backend uses the authorized MCP connection
```

This is standard backend integration work, but it is more than the small MCP wiring example shown on the customization page.

OAuth tokens and other MCP credentials belong on the backend side. The Angular browser app should only start the connection flow and show connection state.

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
