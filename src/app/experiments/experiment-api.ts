import { Injectable } from '@angular/core';

import type {
  DeepAgentsQuickstartRunResponse,
  ExperimentRunResponse,
  OverviewQuickstartRunResponse,
  RunVirtualFileContent,
} from '../../../shared/agent-contracts';

interface ApiErrorResponse {
  readonly message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ExperimentApi {
  async runOverviewQuickstart(): Promise<OverviewQuickstartRunResponse> {
    return await this.postExperimentRun<OverviewQuickstartRunResponse>('overview-quickstart');
  }

  async runDeepAgentsQuickstart(): Promise<DeepAgentsQuickstartRunResponse> {
    return await this.postExperimentRun<DeepAgentsQuickstartRunResponse>('deep-agents-quickstart');
  }

  async getRunVirtualFile(runId: string, path: string): Promise<RunVirtualFileContent> {
    const params = new URLSearchParams({ path });
    const response = await fetch(`/api/experiments/runs/${runId}/files?${params.toString()}`, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorBody = await readErrorBody(response);
      throw new Error(errorBody.message ?? `File request failed with HTTP ${response.status}.`);
    }

    return (await response.json()) as RunVirtualFileContent;
  }

  private async postExperimentRun<TResponse extends ExperimentRunResponse>(
    experimentId: TResponse['experimentId'],
  ): Promise<TResponse> {
    const response = await fetch(`/api/experiments/${experimentId}/runs`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorBody = await readErrorBody(response);
      throw new Error(errorBody.message ?? `Experiment failed with HTTP ${response.status}.`);
    }

    return (await response.json()) as TResponse;
  }
}

async function readErrorBody(response: Response): Promise<ApiErrorResponse> {
  try {
    return (await response.json()) as ApiErrorResponse;
  } catch {
    return {};
  }
}
