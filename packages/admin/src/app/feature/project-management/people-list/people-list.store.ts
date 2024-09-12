import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import {
  withRequestStatus,
  setPending,
  setFulfilled,
  setErrors,
} from '@shared/store/request-status.feature';
import { PersonService } from '@shared/services/person.service';
import { inject } from '@angular/core';
import { PersonModel } from '@shared/models/person.model';
import { firstValueFrom } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';

interface PeopleListState {
  people: PersonModel[];
  limit: number;
  offset: number;
  totalData: number;
  pageIndex: number;
  typeKey: string;
}

const initialState: PeopleListState = {
  people: [],
  limit: 10,
  offset: 0,
  totalData: 0,
  pageIndex: 0,
  typeKey: '',
};

export const PeopleListStore = signalStore(
  withDevtools('people'),
  withState(initialState),
  withRequestStatus(),
  withMethods((store, personService = inject(PersonService)) => ({
    async load(limit: number, offset: number, typeKey: string = '') {
      patchState(store, { ...initialState, typeKey }, setPending());
      const resp = await firstValueFrom(
        personService.getPeople(limit, offset, typeKey),
      );
      if (resp.errors) {
        patchState(store, setErrors(resp.errors));
      } else {
        patchState(
          store,
          { people: resp.data, totalData: resp.meta.count },
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
        personService.getPeople(store.limit(), store.offset(), store.typeKey()),
      );

      if (resp.errors) {
        patchState(store, setErrors(resp.errors));
      } else {
        patchState(
          store,
          { people: resp.data, totalData: resp.meta.count },
          setFulfilled(),
        );
      }
    },
  })),
);
