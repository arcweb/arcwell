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

import { FactTypeService } from '@shared/services/fact-type.service';
import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { FactTypeModel } from '@app/shared/models/fact-type.model';
import { PageEvent } from '@angular/material/paginator';
import { SortDirection } from '@angular/material/sort';

interface FactTypesState {
  factTypes: FactTypeModel[];
  limit: number;
  offset: number;
  totalData: number;
  pageIndex: number;
  sort: string;
  order: SortDirection;
}

const initialState: FactTypesState = {
  factTypes: [],
  limit: 10,
  offset: 0,
  totalData: 0,
  pageIndex: 0,
  sort: 'name',
  order: 'asc',
};

export const FactTypesStore = signalStore(
  withDevtools('factTypes'),
  withState(initialState),
  withRequestStatus(),
  withMethods((store, factTypesService = inject(FactTypeService)) => ({
    async load(props: {
      limit: number;
      offset: number;
      sort?: string;
      order?: SortDirection;
      pageIndex?: number;
    }) {
      patchState(
        store,
        {
          ...initialState,
          sort: props.sort ?? undefined,
          order: props.order ?? undefined,
          pageIndex: props.pageIndex ?? undefined,
        },
        setPending(),
      );
      const resp = await firstValueFrom(
        factTypesService.getFactTypes({
          limit: props.limit,
          offset: props.offset,
          sort: props.sort,
          order: props.order,
        }),
      );
      if (resp.errors) {
        patchState(store, setErrors(resp.errors));
      } else {
        patchState(
          store,
          { factTypes: resp.data, totalData: resp.meta.count },
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
        factTypesService.getFactTypes({
          limit: store.limit(),
          offset: store.offset(),
        }),
      );

      if (resp.errors) {
        patchState(store, setErrors(resp.errors));
      } else {
        patchState(
          store,
          { factTypes: resp.data, totalData: resp.meta.count },
          setFulfilled(),
        );
      }
    },
  })),
  withHooks({
    onInit(store) {
      store.load({ limit: store.limit(), offset: store.offset() });
    },
  }),
);
