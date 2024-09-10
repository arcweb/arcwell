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

interface FactState {
  facts: FactModel[];
  limit: number;
  offset: number;
  totalData: number;
  pageIndex: number;
}

const initialState: FactState = {
  facts: [],
  limit: 10,
  offset: 0,
  totalData: 0,
  pageIndex: 0,
};

export const FactsStore = signalStore(
  withDevtools('facts'),
  withState(initialState),
  withRequestStatus(),
  withMethods((store, factService = inject(FactService)) => ({
    async load(limit: number, offset: number) {
      patchState(store, setPending());
      const resp = await firstValueFrom(factService.getFacts(limit, offset));
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
        factService.getFacts(store.limit(), store.offset()),
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
  withHooks({
    onInit(store) {
      store.load(store.limit(), store.offset());
    },
  }),
);
