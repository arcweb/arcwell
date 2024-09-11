import { Component, inject, effect } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgClass } from '@angular/common';
import { FeatureStore } from '@shared/store/feature.store';

@Component({
  selector: 'aw-features-menu',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, RouterModule, NgClass],
  templateUrl: './features-menu.component.html',
  styleUrl: './features-menu.component.scss',
})
export class FeaturesMenuComponent {
  readonly featureStore = inject(FeatureStore);

  constructor() {
    effect(() => {
      this.featureStore.features();
    });
  }
}
