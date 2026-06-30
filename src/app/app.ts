import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { experimentSections } from './experiments/experiment-catalog';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly sections = experimentSections;
  protected readonly isNavOpen = signal(true);

  protected toggleNav(): void {
    this.isNavOpen.update((isOpen) => !isOpen);
  }
}
