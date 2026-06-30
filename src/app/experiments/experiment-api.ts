import { Injectable } from '@angular/core';

import type { OverviewQuickstartRunResponse } from '../../../shared/agent-contracts';

interface ApiErrorResponse {
  readonly message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ExperimentApi {
  async runOverviewQuickstart(): Promise<OverviewQuickstartRunResponse> {
    const response = await fetch('/api/experiments/overview-quickstart/runs', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorBody = await readErrorBody(response);
      throw new Error(errorBody.message ?? `Experiment failed with HTTP ${response.status}.`);
    }

    return (await response.json()) as OverviewQuickstartRunResponse;
  }
}

async function readErrorBody(response: Response): Promise<ApiErrorResponse> {
  try {
    return (await response.json()) as ApiErrorResponse;
  } catch {
    return {};
  }
}
