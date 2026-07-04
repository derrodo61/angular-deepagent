# Deep Agents Usage Notes

This page tracks details that matter when using LangChain Deep Agents in this project.

## Project Context

- The Angular frontend is the UI and should not import server-only Deep Agents runtime code.
- The Node backend/proxy owns SDK integration, model credentials, privileged tools, filesystem access, and streaming runs.
- Shared frontend/backend contracts belong in `shared/` when they are useful for typed boundaries.
- Server-Sent Events are the default streaming shape for one-way run updates unless the app later needs bidirectional realtime communication.

## Deep Agents Layer

Deep Agents sit above LangChain and LangGraph as an agent harness. They are useful here because the app is evaluating higher-level agent behavior: planning, file context, subagents, skills, memory, and approval-oriented runtime boundaries.

Use direct LangChain agents for narrow single-purpose examples. Use LangGraph directly only when the project needs explicit custom graph control flow.

## Implementation Notes To Fill In

- Package names and versions used by the TypeScript experiment.
- The exact backend adapter boundary for creating and running agents.
- The stream event contract exposed to Angular.
- How tools are validated before being passed to the agent.
- How errors are normalized for the UI without leaking secrets.
- Which Deep Agents features are enabled in each experiment.
- Which current official docs page verified each API detail.
