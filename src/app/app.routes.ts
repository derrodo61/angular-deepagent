import { Routes } from '@angular/router';

import { ExperimentPage } from './experiments/experiment-page/experiment-page';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'experiments/overview',
  },
  {
    path: 'experiments/:experimentId',
    component: ExperimentPage,
  },
  {
    path: '**',
    redirectTo: 'experiments/overview',
  },
];
