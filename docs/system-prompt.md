# System Prompt

A system prompt gives the agent durable instructions about how it should behave.

Plain language: it tells the agent what kind of assistant it is, what job it should do, and what rules matter for this use case.

Official docs:

- [Deep Agents customization: System prompt](https://docs.langchain.com/oss/javascript/deepagents/customization#system-prompt)

## What Problem It Solves

Without a system prompt, the model only sees the user's current request and whatever default instructions the framework provides.

That is often not enough.

For example, the same model could be used as:

- a research assistant
- a coding assistant
- a customer support agent
- a data analysis agent
- a documentation writer

The system prompt tells the agent which role it should play and what result it should optimize for.

Example:

```ts
const researchInstructions =
  'You are an expert researcher. Your job is to conduct thorough research and write a polished report.';

const agent = createDeepAgent({
  model,
  tools,
  systemPrompt: researchInstructions,
});
```

This does not define a new tool. It changes the instructions the model receives before it starts deciding what to do.

## Deep Agents Already Add Instructions

Deep Agents are not just a plain model call.

The SDK adds an orchestration layer with built-in behavior such as planning, filesystem tools, and subagents. The model needs instructions about those capabilities.

That is why Deep Agents include a built-in system prompt.

This built-in prompt teaches the agent how to use the Deep Agents harness. We should not copy it into our own prompt or try to recreate it manually.

Our `systemPrompt` should describe the specific job for this agent.

Deep Agents then combine our instructions with the SDK's built-in instructions.

## Prompt Assembly

Prompt assembly means: how Deep Agents combine different prompt parts into one final system prompt.

The most common shape is:

```text
USER
  -> our systemPrompt

BASE
  -> Deep Agents built-in harness prompt

SUFFIX
  -> optional model/profile-specific guidance
```

The final order is:

```text
USER -> BASE -> SUFFIX
```

In plain language:

1. Our use-case instructions come first.
2. The Deep Agents built-in harness instructions come after that.
3. Optional model-specific guidance can be appended at the end.

This matters because our prompt does not erase the Deep Agents prompt. It is layered together with it.

## What USER Means

`USER` is the `systemPrompt` value we pass to `createDeepAgent`.

Example:

```ts
const agent = createDeepAgent({
  model,
  systemPrompt: 'You are a careful support agent for ACME Corp.',
});
```

This should contain the role, goal, and important behavior for the specific agent.

## What BASE Means

`BASE` is the default Deep Agents system prompt.

It explains the built-in harness capabilities, such as:

- planning
- file management
- subagent delegation
- long-running task behavior

This part is provided by the SDK.

## What SUFFIX Means

`SUFFIX` is optional profile-specific guidance.

Some model profiles can add extra instructions that are useful for a particular provider or model family.

Most app code does not need to manage this directly.

## What To Customize

Customize the agent's job, not the whole Deep Agents harness.

Good system prompts explain:

- the agent's role
- the kind of output it should produce
- important constraints
- when to use available tools
- what quality standard matters

Avoid:

- copying the full Deep Agents built-in prompt
- giving vague personality-only instructions
- adding tool names that do not exist
- putting secrets into the prompt
- making the prompt fight the tool descriptions or backend rules

## Good Mental Model

Think of `systemPrompt` as the job description.

Think of Deep Agents' built-in prompt as the operating manual for the harness.

The final agent needs both:

```text
job description
  + harness operating manual
  + optional model-specific notes
```
