import { Component, inject } from '@angular/core';
import { MatDivider } from '@angular/material/divider';
import { ConfigStore } from '@app/shared/store/config.store';

@Component({
  selector: 'aw-config-bar',
  standalone: true,
  imports: [MatDivider],
  templateUrl: './config-bar.component.html',
  styleUrl: './config-bar.component.scss',
})
export class ConfigBarComponent {
  readonly configStore = inject(ConfigStore);
}
