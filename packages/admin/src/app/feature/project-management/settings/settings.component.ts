import { KeyValuePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatCard, MatCardContent, MatCardHeader } from '@angular/material/card';
import { ConfigStore } from '@app/shared/store/config.store';

@Component({
  selector: 'aw-settings',
  standalone: true,
  imports: [MatCard, MatCardHeader, MatCardContent, KeyValuePipe],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
  readonly configStore = inject(ConfigStore);
}
