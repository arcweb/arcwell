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
import { Router } from '@angular/router';
import { ErrorContainerComponent } from '@app/feature/error-container/error-container.component';
import { AuthStore } from '@app/shared/store/auth.store';
import { ConfigStore } from '@app/shared/store/config.store';

@Component({
  selector: 'aw-forgot-password',
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
  templateUrl: './forgot-password-form.component.html',
  styleUrl: './forgot-password-form.component.scss',
})
export class ForgotPasswordComponent implements OnInit {
  readonly authStore = inject(AuthStore);
  private router: Router = inject(Router);
  destroyRef = inject(DestroyRef);
  private configStore = inject(ConfigStore);

  forgotForm = new FormGroup({
    email: new FormControl('', [Validators.email, Validators.required]),
  });

  ngOnInit() {
    this.forgotForm.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => {
        if (
          (event as ControlEvent) instanceof FormSubmittedEvent &&
          this.forgotForm.controls.email.value
        ) {
          this.authStore.forgotPassword(
            this.forgotForm.controls.email.value,
            location.origin,
          );

          this.router.navigate(['/']);
        }
      });
    // Set title of the application
    this.configStore.setTitle('Forgot Password');
  }
}
