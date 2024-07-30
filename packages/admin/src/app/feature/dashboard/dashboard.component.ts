import {
  Component,
  computed,
  inject,
  OnInit,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { UserService } from '@shared/services/user.service';
import { UserModel } from '@app/shared/models/user.model';
import { combineLatest, mergeMap, Observable, of, switchMap } from 'rxjs';
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

  // TODO: do we want to handle splitting signals from https calls like this?
  private users$: Observable<[UserModel[], UserModel | null]> = this.userService
    .getAllUsers()
    .pipe(
      switchMap((response) =>
        combineLatest([
          of(response),
          this.userService.getUser(response[0].id || ''),
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
