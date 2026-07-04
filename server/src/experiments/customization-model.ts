import { ChatOpenAI } from '@langchain/openai';
import { createDeepAgent } from 'deepagents';
import { tool } from 'langchain';
import { randomUUID } from 'node:crypto';
import * as z from 'zod';

import type { CustomizationModelRunResponse } from '../../../shared/agent-contracts';
import { extractResultText } from '../agent-result';
import { registerRunFiles } from '../run-file-store';

const customizationModelPrompt =
  'Report which model configuration path this experiment uses, then answer in one sentence.';

export async function runCustomizationModel(): Promise<CustomizationModelRunResponse> {
  const apiKey = process.env['OPENAI_API_KEY'];
  const modelName = process.env['OPENAI_MODEL'] ?? 'gpt-5.4-mini';

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required to run the customization model experiment.');
  }

  const getModelConfiguration = tool(
    () =>
      JSON.stringify({
        provider: 'openai',
        model: modelName,
        configurationPath: 'initialized ChatOpenAI instance passed to createDeepAgent',
      }),
    {
      name: 'get_model_configuration',
      description: 'Return the model provider, model name, and configuration path for this run.',
      schema: z.object({}),
    },
  );
  const model = new ChatOpenAI({
    apiKey,
    model: modelName,
  });
  const agent = createDeepAgent({
    model,
    tools: [getModelConfiguration],
    systemPrompt:
      'You are validating Deep Agents model customization. Call get_model_configuration before answering.',
  });

  const rawResult: unknown = await agent.invoke({
    messages: [{ role: 'user', content: customizationModelPrompt }],
  });
  const runId = randomUUID();
  const registeredFiles = registerRunFiles(runId, rawResult);

  return {
    experimentId: 'customization-model',
    runId,
    prompt: customizationModelPrompt,
    resultText: extractResultText(rawResult),
    virtualFiles: registeredFiles.virtualFiles,
    rawResult: registeredFiles.rawResult,
  };
}
