import { Component, inject, effect, OnInit } from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { LoginFormComponent } from '@feature/auth/login/login-form.component';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@shared/data-access/auth.service';
import { AuthStore } from '@shared/store/auth.store';
import { Credentials } from '@shared/interfaces/credentials';
import { MatButton } from '@angular/material/button';
import { ConfigStore } from '@app/shared/store/config.store';

@Component({
  selector: 'aw-login',
  standalone: true,
  imports: [RouterModule, MatProgressSpinner, LoginFormComponent, MatButton],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  public authService = inject(AuthService);
  public authStore = inject(AuthStore);
  private router = inject(Router);
  private configStore = inject(ConfigStore);

  constructor() {
    effect(() => {
      if (this.authStore.loginStatus() === 'set-password') {
        this.router.navigateByUrl(
          `auth/set/${this.authStore.currentUser()?.email}`,
        );
      } else if (this.authStore.currentUser()) {
        this.router.navigate(['/']);
      }
    });
  }

  ngOnInit() {
    // Set title of the application
    this.configStore.setTitle(
      this.authStore.loginStatus() === 'set-password'
        ? 'Set Password'
        : 'Login',
    );
  }

  loginNow($event: Credentials) {
    this.authStore.login($event);
  }
}
