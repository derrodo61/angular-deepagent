import { createDeepAgent } from 'deepagents';
import { ChatOpenAI } from '@langchain/openai';
import { tool } from 'langchain';
import * as z from 'zod';

import type { OverviewQuickstartRunResponse } from '../../../shared/agent-contracts';

const overviewQuickstartPrompt = "What's the weather in Tokyo?";

const getWeather = tool(({ city }) => `It's always sunny in ${city}!`, {
  name: 'get_weather',
  description: 'Get the weather for a given city',
  schema: z.object({
    city: z.string(),
  }),
});

export async function runOverviewQuickstart(): Promise<OverviewQuickstartRunResponse> {
  const apiKey = process.env['OPENAI_API_KEY'];

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required to run the overview quickstart.');
  }

  const agent = createDeepAgent({
    model: new ChatOpenAI({
      apiKey,
      model: process.env['OPENAI_MODEL'] ?? 'gpt-5',
    }),
    tools: [getWeather],
    systemPrompt: 'You are a helpful assistant',
  });

  const rawResult: unknown = await agent.invoke({
    messages: [{ role: 'user', content: overviewQuickstartPrompt }],
  });

  return {
    experimentId: 'overview-quickstart',
    prompt: overviewQuickstartPrompt,
    resultText: extractResultText(rawResult),
    rawResult,
  };
}

function extractResultText(result: unknown): string {
  if (!isRecord(result)) {
    return stringifyUnknown(result);
  }

  const messages = result['messages'];
  if (!Array.isArray(messages)) {
    return stringifyUnknown(result);
  }

  const lastMessage = messages.at(-1);
  if (!isRecord(lastMessage)) {
    return stringifyUnknown(result);
  }

  const content = lastMessage['content'];

  if (typeof content === 'string') {
    return content;
  }

  return stringifyUnknown(content);
}

function stringifyUnknown(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
