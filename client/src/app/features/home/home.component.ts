import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RevealDirective } from '../../core/directives/reveal.directive';
import { ParallaxDirective } from '../../core/directives/parallax.directive';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RevealDirective, ParallaxDirective],
  templateUrl: './home.component.html'
})
export class HomeComponent {}
