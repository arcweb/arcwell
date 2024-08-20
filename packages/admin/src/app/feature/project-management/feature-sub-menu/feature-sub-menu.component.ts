import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FeatureStore } from '@shared/store/feature.store';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'aw-feature-sub-menu',
  standalone: true,
  imports: [RouterModule, MatButtonModule],
  templateUrl: './feature-sub-menu.component.html',
  styleUrl: './feature-sub-menu.component.scss',
})
export class FeatureSubMenuComponent {
  readonly featureStore = inject(FeatureStore);
}
