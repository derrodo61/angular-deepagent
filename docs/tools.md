# Tools

Tools are how an agent does work outside its own text response.

Without tools, the model can only answer from the context it already has. With tools, the agent can ask the application to do a specific job: search, read data, call an API, calculate something, inspect project state, or save a result.

In this project, custom tools belong on the backend side. The Angular app can ask the backend to run an experiment, but browser code should not hold model keys, call privileged tools, or access the local filesystem.

## What Problems Tools Solve

Tools solve the gap between "the model can reason about the task" and "the application can actually do the task."

Good tool use is helpful when the agent needs to:

- get current or external information
- call a private backend API
- use a credential that must stay server-side
- validate input before work happens
- return structured data instead of guessed text
- perform a narrow action that should be easy to test

A tool should be smaller than a full feature. It should do one clear thing and return a result the agent can use.

## Smallest Useful Tool

A tool has two main parts:

1. the function that runs
2. the tool definition that describes the function to LangChain

The tool definition is not only text. It has text parts, such as `name` and `description`, and a technical part, `schema`.

This project uses Zod for the schema. Zod is not part of Deep Agents itself. It is a TypeScript schema library. LangChain tools can use Zod schemas to describe and check tool input. Because Deep Agents use LangChain tools, Zod is a common way to define inputs for Deep Agents tools too.

This is a small useful tool shape for this repo:

```typescript
import { createDeepAgent } from 'deepagents';
import { tool } from 'langchain';
import * as z from 'zod';

interface ProjectFactInput {
  readonly topic: string;
}

const getProjectFact = tool(
  (input: ProjectFactInput) => {
    return `The requested topic is ${input.topic}.`;
  },
  {
    name: 'get_project_fact',
    description: 'Return a short project fact for a requested topic.',
    schema: z.object({
      topic: z.string().describe('The project topic to look up.'),
    }),
  },
);

const agent = createDeepAgent({
  model,
  tools: [getProjectFact],
  systemPrompt: 'Use get_project_fact when the user asks about project facts.',
});
```

## What Each Part Does

`tool` is a function from LangChain. It wraps normal TypeScript code so the agent can call it.

In the examples above, `tool(...)` receives two arguments:

1. the function that runs when the agent calls the tool
2. an options object that describes the tool

The first argument is this arrow function:

```typescript
(input: ProjectFactInput) => {
  return `The requested topic is ${input.topic}.`;
};
```

This function receives the tool input. The schema below tells LangChain what shape that input must have. The function returns the result, which can be a string or structured data.

The function receives one object named `input`. In this example, that object has a `topic` field:

```typescript
input.topic;
```

The TypeScript interface describes that input object:

```typescript
interface ProjectFactInput {
  readonly topic: string;
}
```

This says: the input object has a `topic` field, and `topic` is a string.

The second argument is this options object:

```typescript
{
  name: 'get_project_fact',
  description: 'Return a short project fact for a requested topic.',
  schema: z.object({
    topic: z.string().describe('The project topic to look up.'),
  }),
}
```

This object gives the tool a name, description, and input schema.

`name` is the stable tool name the agent sees. Use a clear action name, usually with underscores, such as `internet_search` or `get_project_fact`.

`description` tells the agent when to use the tool. Write it plainly. A vague description makes the tool harder for the agent to choose correctly.

`schema` describes the allowed input. This project uses Zod schemas.

This part:

```typescript
z.object({
  topic: z.string().describe('The project topic to look up.'),
});
```

means: the tool expects an object with a `topic` field, and `topic` must be a string.

So the same input shape appears in two places:

- the TypeScript interface helps the developer while writing code
- the Zod schema tells LangChain what input shape the tool expects at runtime

This duplication is normal in simple examples. Later, we can avoid some duplication by deriving TypeScript types from Zod schemas.

If this were a normal function call, it would look like this:

```typescript
getProjectFact.invoke({
  topic: 'backend runtime',
});
```

In the real agent run, application code usually does not call the tool directly. The agent decides when to call the tool and passes the input object automatically.

`tools: [getProjectFact]` gives the tool to the Deep Agent. The agent can only call custom tools that are passed into `createDeepAgent`.

`systemPrompt` can explain when the tool should be used. Keep this instruction short and focused.

## TypeScript Shorthand

You may also see the arrow function written like this:

```typescript
({ topic }: { topic: string }) => {
  return `The requested topic is ${topic}.`;
};
```

This is a shorter TypeScript form. It receives one input object, pulls `topic` out of the object immediately, and says that `topic` is a string.

Both versions work. For introductory examples, the longer `input.topic` form is easier to read.

## A No-Input Tool

Some tools do not need input. The model customization experiment uses this pattern to report how the model was configured:

```typescript
const getModelConfiguration = tool(
  () =>
    JSON.stringify({
      provider: 'openai',
      configurationPath: 'initialized ChatOpenAI instance passed to createDeepAgent',
    }),
  {
    name: 'get_model_configuration',
    description: 'Return the model provider and configuration path for this run.',
    schema: z.object({}),
  },
);
```

Use `z.object({})` when the tool has no arguments.

## Where Tools Should Live

For the first experiment, it is fine to keep a small tool close to the experiment that uses it.

When a tool is reused or grows more complex, move it into a focused backend file. For example, search-related code can live under `server/src/search/`, while experiment-specific tool setup can stay in `server/src/experiments/`.

The frontend should interact with the typed backend route, not with the tool directly.

## Basic Checklist

Before adding a tool, check:

- Does it solve one clear problem?
- Is the name stable and specific?
- Is the description plain enough for the agent to choose it?
- Does the schema validate all inputs?
- Does the tool keep secrets and privileged work on the backend?
- Is the returned data useful for the next agent step?

That is the starting point. Later pages can cover tool files, reusable tool factories, error handling, streaming tool events, and tests.
