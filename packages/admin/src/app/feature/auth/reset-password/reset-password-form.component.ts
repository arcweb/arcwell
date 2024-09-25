import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ControlEvent,
  FormControl,
  FormGroup,
  FormSubmittedEvent,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatLabel, MatFormField, MatError } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorContainerComponent } from '@app/feature/project-management/error-container/error-container.component';
import { InputMatch } from '@app/shared/helpers/input-match.helper';
import { AuthStore } from '@app/shared/store/auth.store';

@Component({
  selector: 'aw-reset-password',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatInput,
    MatLabel,
    MatFormField,
    MatButton,
    MatError,
    ErrorContainerComponent,
    MatIcon,
  ],
  templateUrl: './reset-password-form.component.html',
  styleUrl: './reset-password-form.component.scss',
})
export class ResetPasswordComponent implements OnInit {
  readonly authStore = inject(AuthStore);
  private router: Router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  destroyRef = inject(DestroyRef);
  resetCode$ = this.activatedRoute.params.pipe(takeUntilDestroyed());

  resetForm = new FormGroup(
    {
      code: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
      confirmPassword: new FormControl('', [Validators.required]),
    },
    { validators: InputMatch('password', 'confirmPassword') },
  );

  ngOnInit(): void {
    this.resetCode$.subscribe(params => {
      this.resetForm.patchValue({
        code: params['resetCode'],
      });
    });

    this.resetForm.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => {
        if ((event as ControlEvent) instanceof FormSubmittedEvent) {
          this.authStore.resetPassword(this.resetForm.value).then(() => {
            if (this.authStore.loginStatus() !== 'error') {
              this.router.navigate(['auth', 'login']);
            }
          });
        }
      });
  }
}
