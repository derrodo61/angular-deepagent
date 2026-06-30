import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';

import { experiments } from '../experiment-catalog';

@Component({
  selector: 'app-experiment-page',
  templateUrl: './experiment-page.html',
  styleUrl: './experiment-page.css',
})
export class ExperimentPage {
  private readonly route = inject(ActivatedRoute);
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
}
