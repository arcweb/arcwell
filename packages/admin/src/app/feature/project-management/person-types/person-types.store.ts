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

import { PersonTypeService } from '@shared/services/person-type.service';
import { inject } from '@angular/core';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { PersonTypeModel } from '@app/shared/models/person-type.model';
import { PageEvent } from '@angular/material/paginator';

interface PersonTypesState {
  personTypes: PersonTypeModel[];
  limit: number;
  offset: number;
  totalData: number;
  pageIndex: number;
}

const initialState: PersonTypesState = {
  personTypes: [],
  limit: 10,
  offset: 0,
  totalData: 0,
  pageIndex: 0,
};

export const PersonTypesStore = signalStore(
  withDevtools('personTypes'),
  withState(initialState),
  withRequestStatus(),
  withMethods((store, personTypesService = inject(PersonTypeService)) => ({
    async load(limit: number, offset: number) {
      patchState(store, setPending());
      const resp = await firstValueFrom(
        personTypesService.getPersonTypes(limit, offset),
      );
      if (resp.errors) {
        patchState(store, setErrors(resp.errors));
      } else {
        patchState(
          store,
          { personTypes: resp.data, totalData: resp.meta.count },
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
        personTypesService.getPersonTypes(store.limit(), store.offset()),
      );

      if (resp.errors) {
        patchState(store, setErrors(resp.errors));
      } else {
        patchState(
          store,
          { personTypes: resp.data, totalData: resp.meta.count },
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
