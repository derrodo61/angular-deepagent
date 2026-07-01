import { createDeepAgent } from 'deepagents';
import { ChatOpenAI } from '@langchain/openai';
import { tool } from 'langchain';
import * as z from 'zod';

import type { OverviewQuickstartRunResponse } from '../../../shared/agent-contracts';
import { extractResultText } from '../agent-result';

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
      model: process.env['OPENAI_MODEL'] ?? 'gpt-5.4-mini',
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
