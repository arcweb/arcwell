import { Component, computed, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, Observable, of, switchMap } from 'rxjs';

import { UserModel } from '@app/shared/models/user.model';
import { UserService } from '@shared/services/user.service';

@Component({
  selector: 'aw-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private userService: UserService = inject(UserService);

  // TODO: do we want to handle splitting signals from https calls like this?
  private users$: Observable<[UserModel[], UserModel | null]> = this.userService
    .getAllUsers()
    .pipe(
      switchMap(response =>
        combineLatest([
          of(response.users),
          this.userService.getUser(response.users[0].id || ''),
        ]),
      ),
    );

  usersCombined = toSignal(this.users$, {
    initialValue: [[], null],
    rejectErrors: true,
  });

  users: Signal<UserModel[]> = computed(() => this.usersCombined()[0]);
  user: Signal<UserModel | null> = computed(() => this.usersCombined()[1]);

  constructor() {}
}
