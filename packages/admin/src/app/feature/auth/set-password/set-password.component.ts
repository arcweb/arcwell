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
import { ErrorContainerComponent } from '@app/feature/error-container/error-container.component';
import { InputMatch } from '@app/shared/helpers/input-match.helper';
import { AuthStore } from '@app/shared/store/auth.store';

@Component({
  selector: 'aw-set-password',
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
  templateUrl: './set-password.component.html',
  styleUrl: './set-password.component.scss',
})
export class SetPasswordComponent implements OnInit {
  readonly authStore = inject(AuthStore);
  private router: Router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  destroyRef = inject(DestroyRef);
  email$ = this.activatedRoute.params.pipe(takeUntilDestroyed());

  setForm = new FormGroup(
    {
      email: new FormControl('', [Validators.required]),
      tempPassword: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
      confirmPassword: new FormControl('', [Validators.required]),
    },
    {
      validators: [
        InputMatch('password', 'confirmPassword'),
        InputMatch('tempPassword', 'password', true),
      ],
    },
  );

  ngOnInit(): void {
    this.email$.subscribe(params => {
      this.setForm.patchValue({
        email: params['email'],
      });
    });

    this.setForm.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => {
        if ((event as ControlEvent) instanceof FormSubmittedEvent) {
          this.authStore.setPassword(this.setForm.value).then(() => {
            if (this.authStore.loginStatus() !== 'error') {
              this.router.navigate(['auth', 'login']);
            }
          });
        }
      });
  }
}
