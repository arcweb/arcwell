import { Component, effect, inject, Input, OnInit } from '@angular/core';
import {
  ControlEvent,
  FormControl,
  FormGroup,
  FormSubmittedEvent,
  ReactiveFormsModule,
  Validators,
  ValueChangeEvent,
} from '@angular/forms';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { PersonStore } from '@feature/project-management/person/person.store';
import { ErrorContainerComponent } from '@feature/project-management/error-container/error-container.component';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { PersonTypeType } from '@schemas/person-type.schema';
import { Router, RouterLink } from '@angular/router';
import { CREATE_PARTIAL_URL } from '@shared/constants/admin.constants';

@Component({
  selector: 'aw-person',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatInput,
    MatLabel,
    MatFormField,
    MatButton,
    MatError,
    ErrorContainerComponent,
    MatOption,
    MatSelect,
  ],
  providers: [PersonStore],
  templateUrl: './person.component.html',
  styleUrl: './person.component.scss',
})
export class PersonComponent implements OnInit {
  readonly personStore = inject(PersonStore);
  private router = inject(Router);

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
    personType: new FormControl(
      {
        value: null,
        disabled: true,
      },
      Validators.required,
    ),
  });

  constructor() {
    effect(() => {
      if (this.personStore.inEditMode()) {
        this.personForm.enable();
      } else {
        this.personForm.disable();
      }
    });
  }

  ngOnInit(): void {
    if (this.personId) {
      if (this.personId === CREATE_PARTIAL_URL) {
        this.personStore.initializeForCreate();
      } else {
        this.personStore.initialize(this.personId).then(() => {
          this.personForm.patchValue({
            familyName: this.personStore.person()?.familyName,
            givenName: this.personStore.person()?.givenName,
            personType: this.personStore.person()?.personType,
          });
        });
      }
    }

    this.personForm.events.subscribe(event => {
      if ((event as ControlEvent) instanceof FormSubmittedEvent) {
        if (this.personStore.inCreateMode()) {
          this.personStore.create(this.personForm.value);
        } else {
          this.personStore.update(this.personForm.value);
        }
      } else if (event instanceof ValueChangeEvent) {
        // This is here for an example.  Also, there are other events that can be caught
      }
    });
  }

  onCancel() {
    if (this.personStore.inCreateMode()) {
      this.router.navigate(['project-management', 'people', 'all-people']);
    } else {
      this.personStore.toggleEditMode();
    }
  }

  comparePersonTypes(pt1: PersonTypeType, pt2: PersonTypeType): boolean {
    return pt1 && pt2 ? pt1.id === pt2.id : false;
  }
}
