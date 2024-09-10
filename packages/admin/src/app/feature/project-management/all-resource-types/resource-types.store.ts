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

import { ResourceTypeService } from '@shared/services/resource-type.service';
import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ResourceTypeModel } from '@app/shared/models/resource-type.model';
import { PageEvent } from '@angular/material/paginator';

interface ResourceTypesState {
  resourceTypes: ResourceTypeModel[];
  limit: number;
  offset: number;
  totalData: number;
  pageIndex: number;
}

const initialState: ResourceTypesState = {
  resourceTypes: [],
  limit: 10,
  offset: 0,
  totalData: 0,
  pageIndex: 0,
};

export const ResourceTypesStore = signalStore(
  withDevtools('resourceTypes'),
  withState(initialState),
  withRequestStatus(),
  withMethods((store, resourceTypesService = inject(ResourceTypeService)) => ({
    async load(limit: number, offset: number) {
      patchState(store, setPending());
      const resp = await firstValueFrom(
        resourceTypesService.getResourceTypes(limit, offset),
      );
      if (resp.errors) {
        patchState(store, setErrors(resp.errors));
      } else {
        patchState(
          store,
          { resourceTypes: resp.data, totalData: resp.meta.count },
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
        resourceTypesService.getResourceTypes(store.limit(), store.offset()),
      );

      if (resp.errors) {
        patchState(store, setErrors(resp.errors));
      } else {
        patchState(
          store,
          { resourceTypes: resp.data, totalData: resp.meta.count },
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
