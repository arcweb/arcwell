import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastLevel } from '@app/shared/models';
import { RoleType } from '@app/shared/schemas/role.schema';
import { UserType, UserUpdateType } from '@app/shared/schemas/user.schema';
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
      router = inject(Router),
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
        } else if (rolesResp.errors) {
          patchState(store, { isReady: true }, setErrors(rolesResp.errors));
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
        } else {
          patchState(
            store,
            { user: resp.data, inEditMode: false },
            setFulfilled(),
          );
        }
      },
      async create(createUserFormData: UserType) {
        patchState(store, setPending());
        const resp = await firstValueFrom(
          userService.create(createUserFormData),
        );
        if (resp.errors) {
          patchState(store, setErrors(resp.errors));
        } else {
          patchState(
            store,
            {
              inCreateMode: false,
              inEditMode: false,
            },
            setFulfilled(),
          );
          toastService.sendMessage('Created user.', ToastLevel.SUCCESS);
          // navigate the user to the newly created item
          router.navigateByUrl(`/settings/user-management/${resp.data.id}`, {
            replaceUrl: true,
          });
          return resp.data;
        }
      },
      async invite(userId: string) {
        patchState(store, setPending());
        const resp = await firstValueFrom(userService.invite(userId));
        if (resp.errors) {
          patchState(store, setErrors(resp.errors));
        } else {
          patchState(store, { user: resp.data }, setFulfilled());
        }
      },
    }),
  ),
);
