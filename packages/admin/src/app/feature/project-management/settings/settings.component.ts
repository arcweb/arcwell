import { KeyValuePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCard, MatCardContent, MatCardHeader } from '@angular/material/card';
import { MatDivider } from '@angular/material/divider';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { ConfigStore } from '@app/shared/store/config.store';

@Component({
  selector: 'aw-settings',
  standalone: true,
  imports: [
    KeyValuePipe,
    MatCard,
    MatCardHeader,
    MatCardContent,
    MatDivider,
    MatFormField,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
  readonly configStore = inject(ConfigStore);

  instanceForm = new FormGroup({
    instanceName: new FormControl({
      value: this.configStore.config()?.arcwell.name,
      disabled: false,
    }),
    instanceId: new FormControl({
      value: this.configStore.config()?.arcwell?.id,
      disabled: false,
    }),
  });
}
