import { Component, effect, inject, signal } from '@angular/core';
import { UserService } from '@shared/services/user.service';
import { UserModel } from '@app/shared/models/user.model';
import { Observable } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthStore } from '@shared/store/auth.store';
import { Router } from '@angular/router';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'aw-people',
  standalone: true,
  imports: [JsonPipe],
  templateUrl: './people.component.html',
  styleUrl: './people.component.scss',
})
export class PeopleComponent {
  private userService: UserService = inject(UserService);
  private users$: Observable<UserModel[]> = this.userService.getAllUsers();
  readonly authStore = inject(AuthStore);
  private router = inject(Router);

  users = toSignal(this.users$, { initialValue: [], rejectErrors: true });
  user = signal<UserModel | null>(null);

  constructor() {
    effect(() => {
      if (!this.authStore.currentUser()) {
        this.router.navigate(['auth', 'login']);
      }
    });
  }

  loadUser(id: string | undefined) {
    if (id) {
      this.userService
        .getUser(id)
        .subscribe(response => this.user.set(response));
    }
  }
}
