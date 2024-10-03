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
  sort: string;
  order: SortDirection;
  typeKey: string;
}

const initialState: FactsListState = {
  facts: [],
  limit: 10,
  offset: 0,
  totalData: 0,
  pageIndex: 0,
  sort: 'familyName',
  order: 'asc',
  typeKey: '',
};

export const FactsListStore = signalStore(
  withDevtools('facts'),
  withState(initialState),
  withRequestStatus(),
  withMethods((store, factService = inject(FactService)) => ({
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
      const resp = await firstValueFrom(factService.getFacts(props));
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
        factService.getFacts({
          limit: store.limit(),
          offset: store.offset(),
          typeKey: store.typeKey(),
        }),
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
    async count() {
      patchState(store, setPending());
      const resp = await firstValueFrom(factService.count());
      if (resp.errors) {
        patchState(store, setErrors(resp.errors));
      } else {
        console.log('patching', resp);
        patchState(store, { totalData: resp.data.count }, setFulfilled());
      }
    },
  })),
);
