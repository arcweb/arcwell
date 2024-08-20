import { Component, inject, Input, input, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormResetEvent,
  FormSubmittedEvent,
  PristineChangeEvent,
  ReactiveFormsModule,
  TouchedChangeEvent,
  Validators,
  ValueChangeEvent,
} from '@angular/forms';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { PersonStore } from '@feature/project-management/person/person.store';

@Component({
  selector: 'aw-person',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatInput,
    MatLabel,
    MatFormField,
    MatButton,
    MatError,
  ],
  providers: [PersonStore],
  templateUrl: './person.component.html',
  styleUrl: './person.component.scss',
})
export class PersonComponent implements OnInit {
  readonly personStore = inject(PersonStore);

  @Input() personId!: string;

  personForm = new FormGroup({
    familyName: new FormControl(
      {
        value: '',
        disabled: true,
      },
      Validators.required,
    ),
    givenName: new FormControl(
      {
        value: '',
        disabled: true,
      },
      Validators.required,
    ),
    personTypeId: new FormControl(
      {
        value: '',
        disabled: true,
      },
      Validators.required,
    ),
  });

  ngOnInit(): void {
    if (this.personId) {
      this.personStore.load(this.personId).then(resp => {
        this.personForm.patchValue({
          familyName: this.personStore.person()?.familyName,
          givenName: this.personStore.person()?.givenName,
          personTypeId: this.personStore.person()?.personTypeId,
        });
      });
    }

    this.personForm.events.subscribe(event => {
      if (event instanceof FormSubmittedEvent) {
        console.log('Form: Submitted changed=', event);
      } else if (event instanceof FormResetEvent) {
        console.log('Form: Reset', event);
      } else if (event instanceof TouchedChangeEvent) {
        console.log('TouchedChangeEvent', event.touched);
      } else if (event instanceof PristineChangeEvent) {
        console.log('PristineChangeEvent', event.pristine);
      } else if (event instanceof ValueChangeEvent) {
        console.log('familyName changed=', event.value.familyName);
        console.log('givenName changed=', event.value.givenName);
      }
    });
  }
}
