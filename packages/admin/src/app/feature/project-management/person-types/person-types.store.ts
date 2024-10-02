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
import { firstValueFrom } from 'rxjs';
import { PersonTypeModel } from '@app/shared/models/person-type.model';
import { PageEvent } from '@angular/material/paginator';
import { SortDirection } from '@angular/material/sort';

interface PersonTypesState {
  personTypes: PersonTypeModel[];
  limit: number;
  offset: number;
  totalData: number;
  pageIndex: number;
  sort: string;
  order: SortDirection;
}

const initialState: PersonTypesState = {
  personTypes: [],
  limit: 10,
  offset: 0,
  totalData: 0,
  pageIndex: 0,
  sort: 'name',
  order: 'asc',
};

export const PersonTypesStore = signalStore(
  withDevtools('personTypes'),
  withState(initialState),
  withRequestStatus(),
  withMethods((store, personTypesService = inject(PersonTypeService)) => ({
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
        personTypesService.getPersonTypes({
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
        personTypesService.getPersonTypes({
          limit: store.limit(),
          offset: store.offset(),
        }),
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
      store.load({ limit: store.limit(), offset: store.offset() });
    },
  }),
);
