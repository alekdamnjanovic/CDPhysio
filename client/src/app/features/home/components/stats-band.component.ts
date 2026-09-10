import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RevealDirective } from '../../../core/directives/reveal.directive';
import { CountUpDirective } from '../../../core/directives/count-up.directive';

@Component({
  selector: 'app-stats-band',
  standalone: true,
  imports: [RevealDirective, CountUpDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './stats-band.component.html',
})
export class StatsBandComponent {}
