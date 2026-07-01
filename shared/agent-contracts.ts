export interface AgentRunRequest {
  readonly prompt: string;
}

export type AgentRunEvent =
  | {
      readonly type: 'run-started';
      readonly runId: string;
    }
  | {
      readonly type: 'message';
      readonly content: string;
    }
  | {
      readonly type: 'error';
      readonly message: string;
    }
  | {
      readonly type: 'run-finished';
      readonly runId: string;
    };

export interface HealthResponse {
  readonly ok: true;
  readonly service: 'deepagent-backend';
}

export interface OverviewQuickstartRunResponse {
  readonly experimentId: 'overview-quickstart';
  readonly prompt: string;
  readonly resultText: string;
  readonly rawResult: unknown;
}

export interface DeepAgentsQuickstartRunResponse {
  readonly experimentId: 'deep-agents-quickstart';
  readonly prompt: string;
  readonly resultText: string;
  readonly rawResult: unknown;
}

export type ExperimentRunResponse = OverviewQuickstartRunResponse | DeepAgentsQuickstartRunResponse;
