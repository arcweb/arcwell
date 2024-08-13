import { Component, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Credentials } from '@shared/interfaces/credentials';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatButton } from '@angular/material/button';
import { MatInput } from '@angular/material/input';
import { LoginStatus } from '@shared/store/auth.store';

@Component({
  selector: 'aw-login-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatIcon,
    MatError,
    MatProgressSpinner,
    MatButton,
    MatInput,
    MatLabel,
  ],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.scss',
})
export class LoginFormComponent {
  loginStatus = input.required<LoginStatus>();
  login = output<Credentials>();

  private fb = inject(FormBuilder);

  loginForm = this.fb.nonNullable.group({
    email: [''],
    password: [''],
  });
}
