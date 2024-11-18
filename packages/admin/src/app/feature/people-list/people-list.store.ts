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
import { SortDirection } from '@angular/material/sort';
import { ToastService } from '@app/shared/services/toast.service';
import { ToastLevel } from '@app/shared/models';

interface PeopleListState {
  people: PersonModel[];
  limit: number;
  offset: number;
  totalData: number;
  pageIndex: number;
  sort: string;
  order: SortDirection;
  typeKey: string;
  search: { field: string; searchString: string }[];
  csv: string;
}

export const initialState: PeopleListState = {
  people: [],
  limit: 10,
  offset: 0,
  totalData: 0,
  pageIndex: 0,
  sort: 'familyName',
  order: 'asc',
  typeKey: '',
  search: [],
  csv: '',
};

export const PeopleListStore = signalStore(
  withDevtools('people'),
  withState(initialState),
  withRequestStatus(),
  withMethods(
    (
      store,
      personService = inject(PersonService),
      toastService = inject(ToastService),
    ) => ({
      async load(props: {
        limit: number;
        offset: number;
        sort?: string;
        order?: SortDirection;
        pageIndex?: number;
        typeKey?: string;
        search?: { field: string; searchString: string }[];
      }) {
        patchState(
          store,
          {
            ...initialState,
            ...props,
          },
          setPending(),
        );
        const resp = await firstValueFrom(personService.getPeople(props));
        if (resp.errors) {
          patchState(store, setErrors(resp.errors));

          toastService.sendMessage(
            toastService.createCrudMessage('People', 'Fetching', false),
            ToastLevel.ERROR,
          );
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
          personService.getPeople({
            limit: store.limit(),
            offset: store.offset(),
            sort: store.sort(),
            order: store.order(),
            typeKey: store.typeKey(),
            search: store.search(),
          }),
        );

        if (resp.errors) {
          patchState(store, setErrors(resp.errors));

          toastService.sendMessage(
            toastService.createCrudMessage('People', 'Fetching', false),
            ToastLevel.ERROR,
          );
        } else {
          patchState(
            store,
            { people: resp.data, totalData: resp.meta.count },
            setFulfilled(),
          );
        }
      },
      async count() {
        patchState(store, setPending());
        const resp = await firstValueFrom(personService.count());
        if (resp.errors) {
          patchState(store, setErrors(resp.errors));

          toastService.sendMessage(
            toastService.createCrudMessage('People Count', 'Fetching', false),
            ToastLevel.ERROR,
          );
        } else {
          patchState(store, { totalData: resp.data.count }, setFulfilled());
        }
      },
      async getCsv(typeKey?: string) {
        patchState(store, setPending());
        const resp = await firstValueFrom(personService.getCsv(typeKey));
        if (resp.errors || Object.keys(resp).includes('errors')) {
          patchState(store, setErrors(resp.errors));

          toastService.sendMessage(
            toastService.createCrudMessage('People CSV', 'Fetching', false),
            ToastLevel.ERROR,
          );
        } else {
          const blob = new Blob([resp], { type: 'text/csv' });
          const data = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = data;
          link.download = `people${typeKey ? '-' + typeKey : ''}.csv`;
          link.click();
          patchState(store, { csv: resp }, setFulfilled());
        }
      },
    }),
  ),
);
