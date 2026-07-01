import { createDeepAgent } from 'deepagents';
import { ChatOpenAI } from '@langchain/openai';
import { tool } from 'langchain';
import { randomUUID } from 'node:crypto';
import * as z from 'zod';

import type { OverviewQuickstartRunResponse } from '../../../shared/agent-contracts';
import { extractResultText } from '../agent-result';
import { registerRunFiles } from '../run-file-store';

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
  const runId = randomUUID();
  const registeredFiles = registerRunFiles(runId, rawResult);

  return {
    experimentId: 'overview-quickstart',
    runId,
    prompt: overviewQuickstartPrompt,
    resultText: extractResultText(rawResult),
    virtualFiles: registeredFiles.virtualFiles,
    rawResult: registeredFiles.rawResult,
  };
}
