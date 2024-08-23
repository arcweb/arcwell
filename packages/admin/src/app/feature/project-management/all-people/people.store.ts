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
} from '@shared/store/request-status.feature';
import { PersonService } from '@shared/services/person.service';
import { inject } from '@angular/core';
import { PersonModel } from '@shared/models/person.model';
import { firstValueFrom } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';

interface PersonState {
  people: PersonModel[];
  limit: number;
  offset: number;
  totalData: number;
  pageIndex: number;
}

const initialState: PersonState = {
  people: [],
  limit: 10,
  offset: 0,
  totalData: 0,
  pageIndex: 0,
};

export const PeopleStore = signalStore(
  withDevtools('people'),
  withState(initialState),
  withRequestStatus(),
  withMethods((store, personService = inject(PersonService)) => ({
    async load(limit: number, offset: number) {
      patchState(store, setPending());
      const resp: { data: PersonModel[]; meta: { count: number } } =
        await firstValueFrom(personService.getAllPeople(limit, offset));
      patchState(
        store,
        { people: resp.data, totalData: resp.meta.count },
        setFulfilled(),
      );
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
      const resp: { data: PersonModel[]; meta: { count: number } } =
        await firstValueFrom(
          personService.getAllPeople(store.limit(), store.offset()),
        );
      patchState(
        store,
        { people: resp.data, totalData: resp.meta.count },
        setFulfilled(),
      );
    },
  })),
  withHooks({
    onInit(store) {
      store.load(store.limit(), store.offset());
    },
  }),
);
