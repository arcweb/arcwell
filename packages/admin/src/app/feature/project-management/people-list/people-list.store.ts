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
import { Sort, SortDirection } from '@angular/material/sort';

interface PeopleListState {
  people: PersonModel[];
  limit: number;
  offset: number;
  totalData: number;
  pageIndex: number;
  typeKey: string;
  sortColumn: string;
  sortDirection: SortDirection;
}

const initialState: PeopleListState = {
  people: [],
  limit: 10,
  offset: 0,
  totalData: 0,
  pageIndex: 0,
  typeKey: '',
  sortColumn: 'familyName',
  sortDirection: 'asc',
};

export const PeopleListStore = signalStore(
  withDevtools('people'),
  withState(initialState),
  withRequestStatus(),
  withMethods((store, personService = inject(PersonService)) => ({
    async load(
      limit: number,
      offset: number,
      sortColumn = '',
      sortDirection: SortDirection = 'asc',
      typeKey = '',
    ) {
      patchState(
        store,
        { ...initialState, sortColumn, sortDirection, typeKey },
        setPending(),
      );
      const resp = await firstValueFrom(
        personService.getPeople(
          limit,
          offset,
          sortColumn,
          sortDirection,
          typeKey,
        ),
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
        personService.getPeople(
          store.limit(),
          store.offset(),
          store.sortColumn(),
          store.sortDirection(),
          store.typeKey(),
        ),
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
