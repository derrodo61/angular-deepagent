import { Component, computed, input } from '@angular/core';

type MessageRole = 'user' | 'ai' | 'tool' | 'unknown';

interface TokenUsageSummary {
  readonly inputTokens?: number;
  readonly outputTokens?: number;
  readonly totalTokens?: number;
  readonly reasoningTokens?: number;
  readonly cacheReadTokens?: number;
}

interface ToolCallSummary {
  readonly id?: string;
  readonly name: string;
  readonly args: unknown;
  readonly result?: string;
  readonly status?: string;
}

interface InspectorMessage {
  readonly index: number;
  readonly role: MessageRole;
  readonly title: string;
  readonly content: string;
  readonly id?: string;
  readonly modelName?: string;
  readonly modelProvider?: string;
  readonly finishReason?: string;
  readonly tokenUsage?: TokenUsageSummary;
  readonly toolCalls: readonly ToolCallSummary[];
  readonly toolCallId?: string;
  readonly toolName?: string;
  readonly toolStatus?: string;
  readonly raw: unknown;
  readonly initiallyOpen: boolean;
}

interface RunSummary {
  readonly messageCount: number;
  readonly toolCallCount: number;
  readonly modelName?: string;
  readonly modelProvider?: string;
  readonly finishReason?: string;
  readonly totalTokens?: number;
}

interface InspectorViewModel {
  readonly messages: readonly InspectorMessage[];
  readonly toolCalls: readonly ToolCallSummary[];
  readonly summary: RunSummary;
  readonly rawJson: string;
}

@Component({
  selector: 'app-run-inspector',
  templateUrl: './run-inspector.html',
  styleUrl: './run-inspector.css',
})
export class RunInspector {
  readonly rawResult = input.required<unknown>();
  readonly resultText = input<string | null>(null);

  protected readonly viewModel = computed(() =>
    buildViewModel(this.rawResult(), this.resultText()),
  );

  protected formatValue(value: unknown): string {
    if (typeof value === 'string') {
      return value;
    }

    return stringifyJson(value);
  }

  protected tokenSummary(tokens: TokenUsageSummary): string {
    const parts = [
      formatTokenPart('input', tokens.inputTokens),
      formatTokenPart('output', tokens.outputTokens),
      formatTokenPart('reasoning', tokens.reasoningTokens),
      formatTokenPart('cache read', tokens.cacheReadTokens),
      formatTokenPart('total', tokens.totalTokens),
    ].filter((part) => part.length > 0);

    return parts.join(' · ');
  }
}

function buildViewModel(rawResult: unknown, resultText: string | null): InspectorViewModel {
  const messages = getMessages(rawResult).map((message, index) =>
    normalizeMessage(message, index, resultText),
  );
  const toolResults = new Map(
    messages
      .filter((message) => message.role === 'tool' && message.toolCallId)
      .map((message) => [
        message.toolCallId,
        {
          result: message.content,
          status: message.toolStatus,
        },
      ]),
  );
  const toolCalls = messages.flatMap((message) =>
    message.toolCalls.map((toolCall) => ({
      ...toolCall,
      result: toolCall.id ? toolResults.get(toolCall.id)?.result : undefined,
      status: toolCall.id ? toolResults.get(toolCall.id)?.status : undefined,
    })),
  );

  return {
    messages: messages.map((message) => ({
      ...message,
      toolCalls: message.toolCalls.map((toolCall) => ({
        ...toolCall,
        result: toolCall.id ? toolResults.get(toolCall.id)?.result : undefined,
        status: toolCall.id ? toolResults.get(toolCall.id)?.status : undefined,
      })),
    })),
    toolCalls,
    summary: buildSummary(messages, toolCalls),
    rawJson: stringifyJson(rawResult),
  };
}

function normalizeMessage(
  message: unknown,
  index: number,
  resultText: string | null,
): InspectorMessage {
  const record = asRecord(message);
  const kwargs = asRecord(record?.['kwargs']);
  const role = getRole(record, kwargs);
  const content = stringifyContent(kwargs?.['content']);
  const toolCalls = normalizeToolCalls(kwargs);
  const isFinalAnswer = role === 'ai' && resultText !== null && content === resultText;

  return {
    index,
    role,
    title: getMessageTitle(role),
    content,
    id: getString(kwargs?.['id']),
    modelName: getString(asRecord(kwargs?.['response_metadata'])?.['model_name']),
    modelProvider: getString(asRecord(kwargs?.['response_metadata'])?.['model_provider']),
    finishReason: getString(asRecord(kwargs?.['response_metadata'])?.['finish_reason']),
    tokenUsage: normalizeTokenUsage(kwargs),
    toolCalls,
    toolCallId: getString(kwargs?.['tool_call_id']),
    toolName: getString(kwargs?.['name']),
    toolStatus: getString(kwargs?.['status']),
    raw: message,
    initiallyOpen: role === 'user' || role === 'tool' || isFinalAnswer || toolCalls.length > 0,
  };
}

function buildSummary(
  messages: readonly InspectorMessage[],
  toolCalls: readonly ToolCallSummary[],
): RunSummary {
  const aiMessages = messages.filter((message) => message.role === 'ai');
  const lastAiMessage = aiMessages.at(-1);
  const lastTokenMessage = [...messages].reverse().find((message) => message.tokenUsage);

  return {
    messageCount: messages.length,
    toolCallCount: toolCalls.length,
    modelName: lastAiMessage?.modelName,
    modelProvider: lastAiMessage?.modelProvider,
    finishReason: lastAiMessage?.finishReason,
    totalTokens: lastTokenMessage?.tokenUsage?.totalTokens,
  };
}

function getMessages(rawResult: unknown): readonly unknown[] {
  const messages = asRecord(rawResult)?.['messages'];
  return Array.isArray(messages) ? messages : [];
}

function getRole(
  record: Record<string, unknown> | null,
  kwargs: Record<string, unknown> | null,
): MessageRole {
  const constructorName = asStringArray(record?.['id']).at(-1);
  const type = getString(kwargs?.['type']);

  if (constructorName === 'HumanMessage') {
    return 'user';
  }

  if (constructorName === 'AIMessage' || type === 'ai') {
    return 'ai';
  }

  if (constructorName === 'ToolMessage') {
    return 'tool';
  }

  return 'unknown';
}

function getMessageTitle(role: MessageRole): string {
  switch (role) {
    case 'user':
      return 'User';
    case 'ai':
      return 'AI';
    case 'tool':
      return 'Tool';
    default:
      return 'Message';
  }
}

function normalizeToolCalls(kwargs: Record<string, unknown> | null): readonly ToolCallSummary[] {
  const explicitToolCalls = asUnknownArray(kwargs?.['tool_calls']);
  const additionalToolCalls = asUnknownArray(
    asRecord(kwargs?.['additional_kwargs'])?.['tool_calls'],
  );
  const source = explicitToolCalls.length > 0 ? explicitToolCalls : additionalToolCalls;

  return source.map((toolCall) => {
    const record = asRecord(toolCall);
    const fn = asRecord(record?.['function']);
    const name = getString(record?.['name']) ?? getString(fn?.['name']) ?? 'unknown_tool';
    const args = record?.['args'] ?? parseArguments(fn?.['arguments']);

    return {
      id: getString(record?.['id']),
      name,
      args,
    };
  });
}

function normalizeTokenUsage(
  kwargs: Record<string, unknown> | null,
): TokenUsageSummary | undefined {
  const usageMetadata = asRecord(kwargs?.['usage_metadata']);
  const responseTokenUsage = asRecord(asRecord(kwargs?.['response_metadata'])?.['tokenUsage']);

  const summary = {
    inputTokens:
      getNumber(usageMetadata?.['input_tokens']) ?? getNumber(responseTokenUsage?.['promptTokens']),
    outputTokens:
      getNumber(usageMetadata?.['output_tokens']) ??
      getNumber(responseTokenUsage?.['completionTokens']),
    totalTokens:
      getNumber(usageMetadata?.['total_tokens']) ?? getNumber(responseTokenUsage?.['totalTokens']),
    reasoningTokens: getNumber(asRecord(usageMetadata?.['output_token_details'])?.['reasoning']),
    cacheReadTokens: getNumber(asRecord(usageMetadata?.['input_token_details'])?.['cache_read']),
  };

  if (Object.values(summary).every((value) => value === undefined)) {
    return undefined;
  }

  return summary;
}

function stringifyContent(content: unknown): string {
  if (content === undefined || content === null) {
    return '';
  }

  if (typeof content === 'string') {
    return content;
  }

  return stringifyJson(content);
}

function parseArguments(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value;
  }

  try {
    return JSON.parse(value) as unknown;
  } catch {
    return value;
  }
}

function formatTokenPart(label: string, value: number | undefined): string {
  return value === undefined ? '' : `${label}: ${value.toLocaleString()}`;
}

function stringifyJson(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;
}

function asUnknownArray(value: unknown): readonly unknown[] {
  return Array.isArray(value) ? value : [];
}

function asStringArray(value: unknown): readonly string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

function getString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function getNumber(value: unknown): number | undefined {
  return typeof value === 'number' ? value : undefined;
}
