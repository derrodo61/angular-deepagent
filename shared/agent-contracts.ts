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

export interface RunVirtualFile {
  readonly path: string;
  readonly sizeBytes: number;
  readonly mimeType: string;
}

export interface RunVirtualFileContent extends RunVirtualFile {
  readonly runId: string;
  readonly content: string;
}

export interface OverviewQuickstartRunResponse {
  readonly experimentId: 'overview-quickstart';
  readonly runId: string;
  readonly prompt: string;
  readonly resultText: string;
  readonly virtualFiles: readonly RunVirtualFile[];
  readonly rawResult: unknown;
}

export interface DeepAgentsQuickstartRunResponse {
  readonly experimentId: 'deep-agents-quickstart';
  readonly runId: string;
  readonly prompt: string;
  readonly resultText: string;
  readonly virtualFiles: readonly RunVirtualFile[];
  readonly rawResult: unknown;
}

export type ExperimentRunResponse = OverviewQuickstartRunResponse | DeepAgentsQuickstartRunResponse;
