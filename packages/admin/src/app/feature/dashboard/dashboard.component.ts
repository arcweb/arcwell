import { Component, inject, signal } from '@angular/core';
import { UserService } from '@shared/services/user.service';
import { UserModel } from '@app/shared/models/user.model';
import { Observable } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'aw-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private userService: UserService = inject(UserService);

  private users$: Observable<UserModel[]> = this.userService.getAllUsers();

  users = toSignal(this.users$, { initialValue: [], rejectErrors: true });
  user = signal<UserModel | null>(null);

  loadUser(id: string | undefined) {
    if (id) {
      this.userService
        .getUser(id)
        .subscribe(response => this.user.set(response));
    }
  }
}
