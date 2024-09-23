import { Component, DestroyRef, inject, Input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatLabel, MatFormField, MatError } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { Router } from '@angular/router';
import { ErrorContainerComponent } from '@app/feature/project-management/error-container/error-container.component';
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
  destroyRef = inject(DestroyRef);

  @Input() resetToekn!: string;

  resetForm = new FormGroup({
    resetToken: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

  ngOnInit(): void {
    this.resetForm.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => {
        //this.authStore.resetPassword(this.resetForm.value)
      });
  }
}
