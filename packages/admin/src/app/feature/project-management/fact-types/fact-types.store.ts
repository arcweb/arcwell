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
  sortColumn: string;
  sortDirection: SortDirection;
}

const initialState: FactTypesState = {
  factTypes: [],
  limit: 10,
  offset: 0,
  totalData: 0,
  pageIndex: 0,
  sortColumn: 'name',
  sortDirection: 'asc',
};

export const FactTypesStore = signalStore(
  withDevtools('factTypes'),
  withState(initialState),
  withRequestStatus(),
  withMethods((store, factTypesService = inject(FactTypeService)) => ({
    async load(
      limit: number,
      offset: number,
      sortColumn = '',
      sortDirection: SortDirection = 'asc',
    ) {
      patchState(
        store,
        {
          ...initialState,
          sortColumn: sortColumn,
          sortDirection: sortDirection,
        },
        setPending(),
      );
      const resp = await firstValueFrom(
        factTypesService.getFactTypes(limit, offset, sortColumn, sortDirection),
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
        factTypesService.getFactTypes(store.limit(), store.offset()),
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
      store.load(store.limit(), store.offset());
    },
  }),
);
