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
  AbstractControl,
  ControlEvent,
  FormControl,
  FormGroup,
  FormSubmittedEvent,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ErrorContainerComponent } from '@app/feature/error-container/error-container.component';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatOption } from '@angular/material/core';
import { MatLabel, MatFormField, MatError } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RoleType } from '@app/shared/schemas/role.schema';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { AuthStore } from '@app/shared/store/auth.store';
import { BackButtonComponent } from '@shared/components/back-button/back-button.component';
import { map } from 'rxjs';
import { ChangePasswordComponent } from '@app/feature/auth/change-password/change-password-form.component';
import { InputMatch } from '@app/shared/helpers/input-match.helper';
import { DetailHeaderComponent } from '@shared/components/detail-header/detail-header.component';
import { CREATE_PARTIAL_URL } from '@app/shared/constants/admin.constants';
import { ConfirmationDialogComponent } from '@app/shared/components/dialogs/confirmation/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { DetailStore } from '@feature/detail/detail.store';

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
    ChangePasswordComponent,
    DetailHeaderComponent,
  ],
  providers: [UserStore],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss',
})
export class UserComponent implements OnInit {
  readonly dialog = inject(MatDialog);
  readonly userStore = inject(UserStore);
  readonly authStore = inject(AuthStore);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private detailStore = inject(DetailStore);
  readonly isProfile = toSignal(
    this.activatedRoute.data.pipe(
      takeUntilDestroyed(),
      map(({ isProfile }) => isProfile),
    ),
  );

  userAvatar = '';
  viewChangePassword = false;

  destroyRef = inject(DestroyRef);

  @Input() detailId!: string;

  userForm = new FormGroup({
    email: new FormControl(
      {
        value: '',
        disabled: true,
      },
      [Validators.email, Validators.required],
    ),
    password: new FormControl(
      {
        value: '',
        disabled: true,
      },
      [this.hiddenRequiredValidator()],
    ),
    role: new FormControl<RoleType>(
      {
        value: null,
        disabled: true,
      },
      Validators.required,
    ),
  });

  changeForm = new FormGroup(
    {
      password: new FormControl('', [Validators.required]),
      newPassword: new FormControl('', [Validators.required]),
      confirmPassword: new FormControl('', [Validators.required]),
    },
    { validators: InputMatch('newPassword', 'confirmPassword') },
  );

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
    const userId = this.isProfile()
      ? this.authStore.currentUser()?.id
      : this.detailId;
    if (userId) {
      if (userId === CREATE_PARTIAL_URL) {
        this.userStore.initializeForCreate();
      } else {
        this.userStore.initialize(userId).then(() => {
          this.userForm.patchValue({
            email: this.userStore.user()?.email,
            role: this.userStore.user()?.role,
          });
        });
      }
    }

    this.userForm.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(async event => {
        if ((event as ControlEvent) instanceof FormSubmittedEvent) {
          if (this.userStore.inCreateMode()) {
            const formValue = this.userForm.value;

            const userFormPayload = {
              ...formValue,
              roleId: this.isObjectModel(formValue.role)
                ? formValue.role.id
                : null,
              requiresPasswordChange: true,
            };
            const newUser = await this.userStore.create(userFormPayload);
            // TODO: figure out why this is necessary and this function has a stale value
            this.detailId = newUser.id;
            // ask to invite user
            const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
              data: {
                title: 'Invite this person?',
                question:
                  'Would you like to send this Person an email with instructions on how to log in? This will require the person to set their password.',
                okButton: 'Invite',
                cancelButtonText: "Don't Invite",
              },
            });

            dialogRef.afterClosed().subscribe(result => {
              const userId = this.isProfile()
                ? this.authStore.currentUser()?.id
                : this.detailId;
              if (result === true && userId) {
                this.userStore.invite(userId, location.origin);
              }
            });
          } else {
            this.userStore.update(this.userForm.value);
          }
        }
      });

    this.changeForm.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => {
        if ((event as ControlEvent) instanceof FormSubmittedEvent) {
          this.authStore
            .changePassword({
              ...this.changeForm.value,
              email: this.authStore.currentUser()?.email,
            })
            .then(() => {
              if (this.authStore.loginStatus() !== 'error') {
                this.toggleChangePassword();
              }
            });
        }
      });
  }

  isObjectModel(obj: unknown) {
    return (
      obj &&
      typeof obj === 'object' &&
      'id' in obj &&
      typeof obj.id === 'string'
    );
  }

  onCancel() {
    const fromCreateMode = this.userStore.inCreateMode();
    this.userStore.toggleEditMode();
    if (fromCreateMode) {
      this.detailStore.clearDetailId();
    }
  }

  onDelete() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Confirm delete',
        question: 'Are you sure you want to delete this user?',
        okButtonText: 'Delete',
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.userStore.delete();
      }
    });
  }

  compareRoles(r1: RoleType, r2: RoleType): boolean {
    return r1 && r2 ? r1.id === r2.id : false;
  }

  toggleChangePassword() {
    this.viewChangePassword = !this.viewChangePassword;
    this.changeForm.reset();
  }

  hiddenRequiredValidator() {
    return (control: AbstractControl) => {
      if (this.userStore.inCreateMode() && !control.value) {
        return { required: true };
      }
      return null;
    };
  }

  reinvite() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Re-Invite this person?',
        question:
          'Would you like to send this Person an email with instructions on how to log in? This will require the person to reset thier password when they log in next.',
        okButton: 'Invite',
        cancelButtonText: "Don't Invite",
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.userStore.invite(this.detailId!, location.origin);
      }
    });
  }

  viewPerson(personId: string) {
    this.router.navigate(['people', 'list'], {
      queryParams: { detail_id: personId },
    });
  }
}
