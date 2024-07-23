import {
  Component,
  inject,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { UserService } from '@shared/services/user.service';
import { UserModel } from '@app/shared/models/user.model';
import { forkJoin, merge, mergeMap } from 'rxjs';

@Component({
  selector: 'aw-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private userService: UserService = inject(UserService);
  users: WritableSignal<UserModel[]> = signal([]);
  user: WritableSignal<UserModel | null> = signal(null);

  constructor() {}

  ngOnInit() {
    this.userService
      .getAllUsers()
      .pipe(
        mergeMap((response: { users: UserModel[]; count: number }) => {
          this.users.set(response.users);
          return this.userService.getUser(this.users()[0].id || '');
        }),
      )
      .subscribe({
        next: (response: UserModel | null) => {
          if (response) {
            this.user.set(response);
          }
        },
        error: (error: any) => {
          console.error('Error fetching user data', error);
        },
      });
  }
}
