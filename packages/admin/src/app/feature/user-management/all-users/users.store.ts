import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { inject } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { UserModel } from '@app/shared/models';
import { UserService } from '@app/shared/services/user.service';
import {
  setErrors,
  setFulfilled,
  setPending,
  withRequestStatus,
} from '@app/shared/store/request-status.feature';
import {
  patchState,
  signalStore,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';

interface UserState {
  users: UserModel[];
  limit: number;
  offset: number;
  totalData: number;
  pageIndex: number;
}

const initialState: UserState = {
  users: [],
  limit: 10,
  offset: 0,
  totalData: 0,
  pageIndex: 0,
};

export const UserStore = signalStore(
  withDevtools('user'),
  withState(initialState),
  withRequestStatus(),
  withMethods((store, userService = inject(UserService)) => ({
    async load(limit: number, offset: number) {
      patchState(store, setPending());
      const resp = await firstValueFrom(userService.getAllUsers(limit, offset));
      if (resp.errors) {
        patchState(store, setErrors(resp.errors));
      } else {
        patchState(
          store,
          { users: resp.data, totalData: resp.meta.count },
          setFulfilled(),
        );
      }
    },
    async loadPage(event: PageEvent) {
      const newOffset = event.pageIndex * event.pageSize;
      patchState(
        store,
        {
          offset: newOffset,
          pageIndex: event.pageIndex,
          limit: event.pageSize,
        },
        setPending(),
      );
      const resp = await firstValueFrom(
        userService.getAllUsers(store.limit(), store.offset()),
      );

      if (resp.errors) {
        patchState(store, setErrors(resp.errors));
      } else {
        patchState(
          store,
          { users: resp.data, totalData: resp.meta.count },
          setFulfilled(),
        );
      }
    },
  })),
  withHooks({
    onInit(store) {
      store.load(store.limit(), store.offset());
    },
  }),
);
