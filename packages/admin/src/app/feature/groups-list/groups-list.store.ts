import {
  patchState,
  signalStore,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import {
  withRequestStatus,
  setPending,
  setFulfilled,
  setErrors,
} from '@shared/store/request-status.feature';
import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { GroupModel } from '@app/shared/models/group.model';
import { GroupService } from '@app/shared/services/group.service';

interface GroupsListState {
  groups: GroupModel[];
  limit: number;
  offset: number;
  totalData: number;
  pageIndex: number;
  search: { field: string; searchString: string }[];
}

const initialState: GroupsListState = {
  groups: [],
  limit: 10,
  offset: 0,
  totalData: 0,
  pageIndex: 0,
  search: [],
};

export const GroupsListStore = signalStore(
  withDevtools('groups'),
  withState(initialState),
  withRequestStatus(),
  withMethods((store, groupService = inject(GroupService)) => ({
    async load(
      limit: number,
      offset: number,
      search?: { field: string; searchString: string }[],
    ) {
      patchState(
        store,
        { ...initialState, limit, offset, search },
        setPending(),
      );
      const resp = await firstValueFrom(
        groupService.getGroups({ limit, offset, search }),
      );
      if (resp.errors) {
        patchState(store, setErrors(resp.errors));
      } else {
        patchState(
          store,
          { groups: resp.data, totalData: resp.meta.count },
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
        groupService.getGroups({
          limit: store.limit(),
          offset: store.offset(),
          search: store.search(),
        }),
      );

      if (resp.errors) {
        patchState(store, setErrors(resp.errors));
      } else {
        patchState(
          store,
          { groups: resp.data, totalData: resp.meta.count },
          setFulfilled(),
        );
      }
    },
    async count() {
      patchState(store, setPending());
      const resp = await firstValueFrom(groupService.count());
      if (resp.errors) {
        patchState(store, setErrors(resp.errors));
      } else {
        patchState(store, { totalData: resp.data.count }, setFulfilled());
      }
    },
  })),
  withHooks({
    onInit(store) {
      store.load(store.limit(), store.offset(), []);
    },
  }),
);
