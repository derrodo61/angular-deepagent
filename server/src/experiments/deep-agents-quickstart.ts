import { createDeepAgent } from 'deepagents';
import { ChatOpenAI } from '@langchain/openai';
import { tool } from 'langchain';
import { randomUUID } from 'node:crypto';
import * as z from 'zod';

import type { DeepAgentsQuickstartRunResponse } from '../../../shared/agent-contracts';
import { extractResultText } from '../agent-result';
import { registerRunFiles } from '../run-file-store';
import { TavilySearchProvider } from '../search/tavily-search-provider';
import type { SearchProvider } from '../search/search-provider';

const quickstartPrompt = 'What is langgraph?';

const researchInstructions = `You are an expert researcher. Your job is to conduct thorough research and then write a polished report.

You have access to an internet search tool as your primary means of gathering information.

## \`internet_search\`

Use this to run an internet search for a given query. You can specify the max number of results to return, the topic, and whether raw content should be included.`;

export async function runDeepAgentsQuickstart(): Promise<DeepAgentsQuickstartRunResponse> {
  const openAiApiKey = process.env['OPENAI_API_KEY'];
  const tavilyApiKey = process.env['TAVILY_API_KEY'];

  if (!openAiApiKey) {
    throw new Error('OPENAI_API_KEY is required to run the Deep Agents quickstart.');
  }

  if (!tavilyApiKey) {
    throw new Error('TAVILY_API_KEY is required to run the Deep Agents quickstart.');
  }

  const internetSearch = createInternetSearchTool(new TavilySearchProvider(tavilyApiKey));
  const agent = createDeepAgent({
    model: new ChatOpenAI({
      apiKey: openAiApiKey,
      model: process.env['OPENAI_MODEL'] ?? 'gpt-5.4-mini',
    }),
    tools: [internetSearch],
    systemPrompt: researchInstructions,
  });

  const rawResult: unknown = await agent.invoke({
    messages: [{ role: 'user', content: quickstartPrompt }],
  });
  const runId = randomUUID();
  const registeredFiles = registerRunFiles(runId, rawResult);

  return {
    experimentId: 'deep-agents-quickstart',
    runId,
    prompt: quickstartPrompt,
    resultText: extractResultText(rawResult),
    virtualFiles: registeredFiles.virtualFiles,
    rawResult: registeredFiles.rawResult,
  };
}

function createInternetSearchTool(searchProvider: SearchProvider) {
  return tool(
    async ({
      query,
      maxResults = 5,
      topic = 'general',
      includeRawContent = false,
    }: {
      query: string;
      maxResults?: number;
      topic?: 'general' | 'news' | 'finance';
      includeRawContent?: boolean;
    }) => await searchProvider.search({ query, maxResults, topic, includeRawContent }),
    {
      name: 'internet_search',
      description: 'Run a web search',
      schema: z.object({
        query: z.string().describe('The search query'),
        maxResults: z
          .number()
          .optional()
          .default(5)
          .describe('Maximum number of results to return'),
        topic: z
          .enum(['general', 'news', 'finance'])
          .optional()
          .default('general')
          .describe('Search topic category'),
        includeRawContent: z
          .boolean()
          .optional()
          .default(false)
          .describe('Whether to include raw content'),
      }),
    },
  );
}
