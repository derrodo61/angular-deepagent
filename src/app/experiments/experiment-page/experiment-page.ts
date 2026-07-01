import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';

import type { OverviewQuickstartRunResponse } from '../../../../shared/agent-contracts';
import { ExperimentApi } from '../experiment-api';
import { experiments } from '../experiment-catalog';
import { RunInspector } from '../run-inspector/run-inspector';

type RunState = 'idle' | 'running' | 'succeeded' | 'failed';

@Component({
  selector: 'app-experiment-page',
  imports: [RunInspector],
  templateUrl: './experiment-page.html',
  styleUrl: './experiment-page.css',
})
export class ExperimentPage {
  private readonly route = inject(ActivatedRoute);
  private readonly experimentApi = inject(ExperimentApi);
  private readonly experimentId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('experimentId'))),
    {
      initialValue: 'overview',
    },
  );

  protected readonly experiment = computed(() => {
    const id = this.experimentId();
    return experiments.find((item) => item.id === id) ?? experiments[0];
  });

  protected readonly canRunOverviewQuickstart = computed(() => this.experiment().id === 'overview');
  protected readonly runState = signal<RunState>('idle');
  protected readonly result = signal<OverviewQuickstartRunResponse | null>(null);
  protected readonly errorMessage = signal<string | null>(null);

  protected async runOverviewQuickstart(): Promise<void> {
    this.runState.set('running');
    this.result.set(null);
    this.errorMessage.set(null);

    try {
      const result = await this.experimentApi.runOverviewQuickstart();
      this.result.set(result);
      this.runState.set('succeeded');
    } catch (error) {
      this.errorMessage.set(error instanceof Error ? error.message : 'Experiment failed.');
      this.runState.set('failed');
    }
  }

  protected resetRun(): void {
    this.runState.set('idle');
    this.result.set(null);
    this.errorMessage.set(null);
  }
}
