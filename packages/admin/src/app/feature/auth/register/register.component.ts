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

@Component({
  selector: 'aw-register',
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
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent implements OnInit {
  readonly authStore = inject(AuthStore);
  private router: Router = inject(Router);
  destroyRef = inject(DestroyRef);

  registerForm = new FormGroup({
    givenName: new FormControl('', [Validators.required]),
    familyName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required]),
  });

  ngOnInit(): void {
    this.registerForm.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => {
        if ((event as ControlEvent) instanceof FormSubmittedEvent) {
          this.authStore.register(this.registerForm.value).then(() => {
            if (this.authStore.loginStatus() !== 'error') {
              this.router.navigate(['auth', 'login']);
            }
          });
        }
      });
  }
}
