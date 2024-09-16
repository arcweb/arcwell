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
import { FactService } from '@shared/services/fact.service';
import { inject } from '@angular/core';
import { FactModel } from '@shared/models/fact.model';
import { firstValueFrom } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { SortDirection } from '@angular/material/sort';

interface FactsListState {
  facts: FactModel[];
  limit: number;
  offset: number;
  totalData: number;
  pageIndex: number;
  sortColumn: string;
  sortDirection: SortDirection;
  typeKey: string;
}

const initialState: FactsListState = {
  facts: [],
  limit: 10,
  offset: 0,
  totalData: 0,
  pageIndex: 0,
  sortColumn: 'familyName',
  sortDirection: 'asc',
  typeKey: '',
};

export const FactsListStore = signalStore(
  withDevtools('facts'),
  withState(initialState),
  withRequestStatus(),
  withMethods((store, factService = inject(FactService)) => ({
    async load(
      limit: number,
      offset: number,
      sortColumn = '',
      sortDirection: SortDirection = 'asc',
      typeKey = '',
    ) {
      patchState(
        store,
        {
          ...initialState,
          sortColumn: sortColumn,
          sortDirection: sortDirection,
          typeKey: typeKey,
        },
        setPending(),
      );
      const resp = await firstValueFrom(
        factService.getFacts(limit, offset, sortColumn, sortDirection, typeKey),
      );
      if (resp.errors) {
        patchState(store, setErrors(resp.errors));
      } else {
        patchState(
          store,
          { facts: resp.data, totalData: resp.meta.count },
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
        factService.getFacts(store.limit(), store.offset(), store.typeKey()),
      );

      if (resp.errors) {
        patchState(store, setErrors(resp.errors));
      } else {
        patchState(
          store,
          { facts: resp.data, totalData: resp.meta.count },
          setFulfilled(),
        );
      }
    },
  })),
);
