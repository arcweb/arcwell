import { Component, effect, inject, Input, OnInit } from '@angular/core';
import { UserStore } from './user.store';
import { ControlEvent, FormControl, FormGroup, FormSubmittedEvent, Validators } from '@angular/forms';
import { CREATE_PARTIAL_URL } from '@app/shared/constants/admin.constants';

@Component({
  selector: 'aw-user',
  standalone: true,
  imports: [],
  providers: [UserStore],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss',
})
export class UserComponent implements OnInit {
  readonly userStore = inject(UserStore);

  @Input() userId!: string;

  userForm = new FormGroup({
    email: new FormControl(
      {
        value: '',
        disabled: true,
      },
      [Validators.email, Validators.required],
    ),
    role: new FormControl(
      {
        value: null,
        disabled: true,
      },
      Validators.required,
    ),
  });

  constructor() {
    effect(() => {
      if (this.userStore.inEditMode()) {
        this.userForm.enable();
      } else {
        this.userForm.disable();
      }
    });
  }

  ngOnInit(): void {
    if (this.userId) {
      this.userStore.initialize(this.userId).then(() => {
        this.userForm.patchValue({
          email: this.userStore.user()?.email,
          role: this.userStore.user()?.role,
        });
      });
    }

    this.userForm.events.subscribe(event => {
      if ((event as ControlEvent) instanceof FormSubmittedEvent) {
        this.userStore.update(this.userForm.value);
      }
    });
  }

  onCancel() {
    this.userStore.toggleEditMode();
  }
}
