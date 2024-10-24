import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { inject } from '@angular/core';
import { DetailStore } from '@feature/detail/detail.store';
import { ToastLevel } from '@app/shared/models';
import { RoleType } from '@app/shared/schemas/role.schema';
import { UserType, UserUpdateType } from '@app/shared/schemas/user.schema';
import { RefreshService } from '@app/shared/services/refresh.service';
import { RoleService } from '@app/shared/services/role.service';
import { ToastService } from '@app/shared/services/toast.service';
import { UserService } from '@app/shared/services/user.service';
import {
  setErrors,
  setFulfilled,
  setPending,
  withRequestStatus,
} from '@app/shared/store/request-status.feature';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom, forkJoin } from 'rxjs';

interface UserState {
  user: UserType | null;
  roles: RoleType[] | null;
  inEditMode: boolean;
  inCreateMode: boolean;
  isReady: boolean;
}

const initialState: UserState = {
  user: null,
  roles: [],
  inEditMode: false,
  isReady: false,
  inCreateMode: false,
};

export const UserStore = signalStore(
  withDevtools('user'),
  withState(initialState),
  withRequestStatus(),
  withMethods(
    (
      store,
      userService = inject(UserService),
      roleService = inject(RoleService),
      toastService = inject(ToastService),
      detailStore = inject(DetailStore),
      refreshService = inject(RefreshService),
    ) => ({
      async initialize(userId: string) {
        patchState(store, setPending());
        const { userResp, rolesResp } = await firstValueFrom(
          forkJoin({
            userResp: userService.getUser(userId),
            rolesResp: roleService.getAllRoles({}),
          }),
        );
        if (userResp.errors) {
          patchState(store, { isReady: true }, setErrors(userResp.errors));

          toastService.sendMessage(
            toastService.createCrudMessage('User', 'Fetching', false),
            ToastLevel.ERROR,
          );
        } else if (rolesResp.errors) {
          patchState(store, { isReady: true }, setErrors(rolesResp.errors));

          toastService.sendMessage(
            toastService.createCrudMessage('Roles', 'Fetching', false),
            ToastLevel.ERROR,
          );
        } else {
          patchState(
            store,
            {
              user: userResp.data,
              roles: rolesResp.data,
              isReady: true,
            },
            setFulfilled(),
          );
        }
      },
      async initializeForCreate() {
        patchState(store, setPending());
        const rolesResp = await firstValueFrom(roleService.getAllRoles({}));
        if (rolesResp.errors) {
          patchState(store, { isReady: true }, setErrors(rolesResp.errors));

          toastService.sendMessage(
            toastService.createCrudMessage('Roles', 'Fetching', false),
            ToastLevel.ERROR,
          );
        } else {
          patchState(
            store,
            {
              roles: rolesResp.data,
              inCreateMode: true,
              inEditMode: true,
              isReady: true,
            },
            setFulfilled(),
          );
        }
      },
      async toggleEditMode() {
        patchState(store, {
          inEditMode: !store.inEditMode(),
          inCreateMode: false,
        });
      },
      async update(updateUserFormData: UserUpdateType) {
        patchState(store, setPending());
        updateUserFormData.id = store.user().id;
        if (updateUserFormData.role) {
          updateUserFormData.roleId = updateUserFormData.role.id;
        }
        const resp = await firstValueFrom(
          userService.update(updateUserFormData),
        );
        if (resp.errors) {
          patchState(store, setErrors(resp.errors));

          toastService.sendMessage(
            toastService.createCrudMessage('User', 'Updating', false),
            ToastLevel.ERROR,
          );
        } else {
          patchState(
            store,
            { user: resp.data, inEditMode: false },
            setFulfilled(),
          );

          toastService.sendMessage(
            toastService.createCrudMessage('User', 'Updated'),
            ToastLevel.SUCCESS,
          );

          // refresh the list
          refreshService.triggerRefresh();
        }
      },
      async create(createUserFormData: UserType): Promise<UserType> {
        patchState(store, setPending());
        const resp = await firstValueFrom(
          userService.create(createUserFormData),
        );
        if (resp.errors) {
          patchState(store, setErrors(resp.errors));

          toastService.sendMessage(
            toastService.createCrudMessage('User', 'Creating', false),
            ToastLevel.ERROR,
          );
        } else {
          patchState(
            store,
            {
              inCreateMode: false,
              inEditMode: false,
            },
            setFulfilled(),
          );

          toastService.sendMessage(
            toastService.createCrudMessage('User', 'Created'),
            ToastLevel.SUCCESS,
          );

          // refresh the list
          refreshService.triggerRefresh();

          // navigate the user to the newly created item
          detailStore.routeToNewDetailId(resp.data.id);
          return resp.data;
        }
      },
      async delete() {
        patchState(store, setPending());
        const resp = await firstValueFrom(userService.delete(store.user().id));
        if (resp && resp.errors) {
          patchState(store, setErrors(resp.errors));

          toastService.sendMessage(
            toastService.createCrudMessage('User', 'Deleting', false),
            ToastLevel.ERROR,
          );
        } else {
          patchState(store, { inEditMode: false }, setFulfilled());

          toastService.sendMessage(
            toastService.createCrudMessage('User', 'Deleted'),
            ToastLevel.SUCCESS,
          );

          // refresh the list
          refreshService.triggerRefresh();
          // clear the detail_id to close the drawer
          detailStore.clearDetailId();
        }
      },
      async invite(userId: string, host: string) {
        patchState(store, setPending());
        const resp = await firstValueFrom(userService.invite(userId, host));
        if (resp.errors) {
          patchState(store, setErrors(resp.errors));

          toastService.sendMessage(
            toastService.createCrudMessage('User', 'Inviting', false),
            ToastLevel.ERROR,
          );
        } else {
          patchState(store, { user: resp.data }, setFulfilled());

          toastService.sendMessage(
            toastService.createCrudMessage('User', 'Invited'),
            ToastLevel.SUCCESS,
          );
        }
      },
    }),
  ),
);
