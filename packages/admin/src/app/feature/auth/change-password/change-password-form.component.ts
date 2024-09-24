import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlEvent, FormControl, FormGroup, FormSubmittedEvent, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { InputMatch } from '@app/shared/helpers/input-match.helper';
import { AuthStore } from '@app/shared/store/auth.store';

@Component({
  selector: 'aw-change-password',
  standalone: true,
  imports: [],
  templateUrl: './change-password-form.component.html',
  styleUrl: './change-password-form.component.scss',
})
export class ChangePasswordComponent implements OnInit {
  readonly authStore = inject(AuthStore);
  private router: Router = inject(Router);
  destroyRef = inject(DestroyRef);

  changeForm = new FormGroup(
    {
      currentPassword: new FormControl('', [Validators.required]),
      newPassword: new FormControl('', [Validators.required]),
      confirmPassword: new FormControl('', [Validators.required]),
    },
    { validators: InputMatch('newPassword', 'confirmPassword') },
  );

  ngOnInit(): void {
    this.changeForm.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => {
        if ((event as ControlEvent) instanceof FormSubmittedEvent) {
          // this.authStore.changePassword
        }
      });
  }
}
