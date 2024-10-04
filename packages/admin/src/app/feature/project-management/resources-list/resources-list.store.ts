import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import {
  withRequestStatus,
  setPending,
  setFulfilled,
  setErrors,
} from '@shared/store/request-status.feature';
import { inject } from '@angular/core';
import { ResourceModel } from '@shared/models/resource.model';
import { firstValueFrom } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { ResourceService } from '@shared/services/resource.service';
import { SortDirection } from '@angular/material/sort';

interface ResourceListState {
  resources: ResourceModel[];
  limit: number;
  offset: number;
  totalData: number;
  pageIndex: number;
  sort: string;
  order: SortDirection;
  typeKey: string;
}

const initialState: ResourceListState = {
  resources: [],
  limit: 10,
  offset: 0,
  totalData: 0,
  pageIndex: 0,
  sort: 'name',
  order: 'asc',
  typeKey: '',
};

export const ResourcesListStore = signalStore(
  withDevtools('resources'),
  withState(initialState),
  withRequestStatus(),
  withMethods((store, resourceService = inject(ResourceService)) => ({
    async load(props: {
      limit: number;
      offset: number;
      sort?: string;
      order?: SortDirection;
      pageIndex?: number;
      typeKey?: string;
    }) {
      patchState(
        store,
        {
          ...initialState,
          ...props,
        },
        setPending(),
      );
      const resp = await firstValueFrom(resourceService.getResources(props));
      if (resp.errors) {
        patchState(store, setErrors(resp.errors));
      } else {
        patchState(
          store,
          { resources: resp.data, totalData: resp.meta.count },
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
        resourceService.getResources({
          limit: store.limit(),
          offset: store.offset(),
          sort: store.sort(),
          order: store.order(),
          typeKey: store.typeKey(),
        }),
      );

      if (resp.errors) {
        patchState(store, setErrors(resp.errors));
      } else {
        patchState(
          store,
          { resources: resp.data, totalData: resp.meta.count },
          setFulfilled(),
        );
      }
    },
    async count() {
      patchState(store, setPending());
      const resp = await firstValueFrom(resourceService.count());
      if (resp.errors) {
        patchState(store, setErrors(resp.errors));
      } else {
        patchState(store, { totalData: resp.data.count }, setFulfilled());
      }
    },
  })),
);
