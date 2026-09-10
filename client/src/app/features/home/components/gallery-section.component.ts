import { Component, ChangeDetectionStrategy } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RevealDirective } from '../../../core/directives/reveal.directive';
import {
  TRAINING_GALLERY_ITEMS,
  CLIENT_GALLERY_ITEMS,
} from '../../../core/constants/gallery.constants';

@Component({
  selector: 'app-gallery-section',
  standalone: true,
  imports: [RevealDirective, NgFor, NgIf],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './gallery-section.component.html',
})
export class GallerySectionComponent {
  protected readonly trainingList = TRAINING_GALLERY_ITEMS;
  protected readonly clientList = CLIENT_GALLERY_ITEMS;
}
