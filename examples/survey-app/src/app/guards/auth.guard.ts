import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '@services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  async canActivate(): Promise<boolean> {
    const isAuthenticated = await this.authService.isAuthenticated();

    if (!isAuthenticated) {
      this.authService.clearToken();
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }
}
