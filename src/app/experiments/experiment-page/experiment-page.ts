import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';

import type { ExperimentRunResponse } from '../../../../shared/agent-contracts';
import { RunInspector } from '../components/run-inspector/run-inspector';
import { ExperimentApi } from '../experiment-api';
import { experiments } from '../experiment-catalog';

type RunState = 'idle' | 'running' | 'succeeded' | 'failed';

interface RunnableExperiment {
  readonly description: string;
  readonly prompt: string;
  readonly runButtonLabel: string;
  readonly runningLabel: string;
  run(): Promise<ExperimentRunResponse>;
}

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

  protected readonly runnableExperiment = computed<RunnableExperiment | null>(() => {
    switch (this.experiment().id) {
      case 'overview':
        return {
          description:
            'Runs the weather-tool quickstart from the Deep Agents overview page through the Node backend.',
          prompt: "What's the weather in Tokyo?",
          runButtonLabel: 'Run overview quickstart',
          runningLabel: 'Running overview...',
          run: () => this.experimentApi.runOverviewQuickstart(),
        };
      case 'quickstart':
        return {
          description:
            'Runs the research-agent quickstart with Tavily search through the Node backend.',
          prompt: 'What is langgraph?',
          runButtonLabel: 'Run Tavily quickstart',
          runningLabel: 'Running research...',
          run: () => this.experimentApi.runDeepAgentsQuickstart(),
        };
      case 'customization-model':
        return {
          description:
            'Runs the model customization example with an initialized ChatOpenAI instance.',
          prompt:
            'Report which model configuration path this experiment uses, then answer in one sentence.',
          runButtonLabel: 'Run model customization',
          runningLabel: 'Running model check...',
          run: () => this.experimentApi.runCustomizationModel(),
        };
      default:
        return null;
    }
  });
  protected readonly runState = signal<RunState>('idle');
  protected readonly result = signal<ExperimentRunResponse | null>(null);
  protected readonly errorMessage = signal<string | null>(null);

  protected async runExperiment(): Promise<void> {
    const runnable = this.runnableExperiment();
    if (!runnable) {
      return;
    }

    this.runState.set('running');
    this.result.set(null);
    this.errorMessage.set(null);

    try {
      const result = await runnable.run();
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
