import cors from '@fastify/cors';
import { config } from 'dotenv';
import Fastify from 'fastify';
import { z } from 'zod';

import type { AgentRunEvent, HealthResponse } from '../../shared/agent-contracts';
import { runCustomizationModel } from './experiments/customization-model';
import { runDeepAgentsQuickstart } from './experiments/deep-agents-quickstart';
import { runOverviewQuickstart } from './experiments/overview-quickstart';
import { readRunFile } from './run-file-store';

config();

const agentRunRequestSchema = z.object({
  prompt: z.string().trim().min(1),
});
const runFileParamsSchema = z.object({
  runId: z.string().uuid(),
});
const runFileQuerySchema = z.object({
  path: z.string().min(1).startsWith('/'),
});

const server = Fastify({
  logger: true,
});

async function startServer(): Promise<void> {
  await server.register(cors, {
    origin: process.env['CLIENT_ORIGIN'] ?? 'http://localhost:4200',
  });

  server.get('/api/health', async (): Promise<HealthResponse> => ({
    ok: true,
    service: 'deepagent-backend',
  }));

  server.post('/api/experiments/overview-quickstart/runs', async (_request, reply) => {
    try {
      return await runOverviewQuickstart();
    } catch (error) {
      requestLogError(error);

      return reply.code(500).send({
        message: getErrorMessage(error),
      });
    }
  });

  server.post('/api/experiments/deep-agents-quickstart/runs', async (_request, reply) => {
    try {
      return await runDeepAgentsQuickstart();
    } catch (error) {
      requestLogError(error);

      return reply.code(500).send({
        message: getErrorMessage(error),
      });
    }
  });

  server.post('/api/experiments/customization-model/runs', async (_request, reply) => {
    try {
      return await runCustomizationModel();
    } catch (error) {
      requestLogError(error);

      return reply.code(500).send({
        message: getErrorMessage(error),
      });
    }
  });

  server.get('/api/experiments/runs/:runId/files', async (request, reply) => {
    const params = runFileParamsSchema.safeParse(request.params);
    const query = runFileQuerySchema.safeParse(request.query);

    if (!params.success || !query.success) {
      return reply.code(400).send({
        message: 'A valid run id and virtual file path are required.',
      });
    }

    const file = readRunFile(params.data.runId, query.data.path);

    if (!file) {
      return reply.code(404).send({
        message: 'Virtual file not found. It may have expired or belongs to another run.',
      });
    }

    return file;
  });

  server.post('/api/agent-runs', async (request, reply) => {
    const parsed = agentRunRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.code(400).send({
        message: 'Prompt is required.',
      });
    }

    const runId = crypto.randomUUID();

    reply.raw.writeHead(200, {
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'Content-Type': 'text/event-stream; charset=utf-8',
    });

    writeServerSentEvent(reply.raw, {
      type: 'run-started',
      runId,
    });

    writeServerSentEvent(reply.raw, {
      type: 'message',
      content: `Received prompt: ${parsed.data.prompt}`,
    });

    writeServerSentEvent(reply.raw, {
      type: 'run-finished',
      runId,
    });

    reply.raw.end();
  });

  const port = Number(process.env['PORT'] ?? 3000);
  const host = process.env['HOST'] ?? '127.0.0.1';

  await server.listen({
    host,
    port,
  });
}

function writeServerSentEvent(stream: NodeJS.WritableStream, event: AgentRunEvent): void {
  stream.write(`data: ${JSON.stringify(event)}\n\n`);
}

function requestLogError(error: unknown): void {
  server.log.error({ error }, 'Experiment run failed');
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Experiment run failed.';
}

void startServer();
