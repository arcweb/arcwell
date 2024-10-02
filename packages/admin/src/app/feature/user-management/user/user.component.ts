import {
  Component,
  DestroyRef,
  effect,
  inject,
  Input,
  OnInit,
} from '@angular/core';
import { UserStore } from './user.store';
import {
  ControlEvent,
  FormControl,
  FormGroup,
  FormSubmittedEvent,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ErrorContainerComponent } from '@feature/project-management/error-container/error-container.component';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatOption } from '@angular/material/core';
import { MatLabel, MatFormField, MatError } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RoleType } from '@app/shared/schemas/role.schema';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { AuthStore } from '@app/shared/store/auth.store';
import { EmailService } from '@app/shared/services/email.service';
import { BackButtonComponent } from '../../../shared/components/back-button/back-button.component';
import { map } from 'rxjs';

@Component({
  selector: 'aw-user',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatInput,
    MatLabel,
    MatFormField,
    MatButton,
    MatError,
    ErrorContainerComponent,
    MatOption,
    MatSelect,
    MatIcon,
    RouterLink,
    MatIconButton,
    MatCardModule,
    BackButtonComponent,
  ],
  providers: [UserStore],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss',
})
export class UserComponent implements OnInit {
  readonly userStore = inject(UserStore);
  readonly authStore = inject(AuthStore);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private isProfile = this.activatedRoute.data.pipe(
    takeUntilDestroyed(),
    map(({ isProfile }) => isProfile),
  );
  private emailService: EmailService = inject(EmailService);
  userAvatar = '';

  destroyRef = inject(DestroyRef);

  @Input() userId!: string;

  userForm = new FormGroup({
    email: new FormControl(
      {
        value: '',
        disabled: true,
      },
      [Validators.email, Validators.required],
    ),
    role: new FormControl(
      {
        value: null,
        disabled: true,
      },
      Validators.required,
    ),
  });

  constructor() {
    effect(() => {
      if (this.userStore.inEditMode()) {
        this.userForm.enable();
      } else {
        this.userForm.disable();
      }
    });
  }

  ngOnInit(): void {
    // if the route data contains isProfile use the current user id else use the userId from the params
    const userId = this.isProfile
      ? this.authStore.currentUser()?.id
      : this.userId;
    if (userId) {
      this.userStore.initialize(userId).then(() => {
        this.userForm.patchValue({
          email: this.userStore.user()?.email,
          role: this.userStore.user()?.role,
        });
      });
    }

    this.userForm.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => {
        if ((event as ControlEvent) instanceof FormSubmittedEvent) {
          this.userStore.update(this.userForm.value);
        }
      });
  }

  onCancel() {
    this.userStore.toggleEditMode();
  }

  compareRoles(r1: RoleType, r2: RoleType): boolean {
    return r1 && r2 ? r1.id === r2.id : false;
  }

  sendEmail() {
    this.emailService
      .sendEmail(this.authStore.currentUser()!.email)
      .subscribe();
  }

  changePassword() {
    this.router.navigate(['auth', 'change']);
  }
}
