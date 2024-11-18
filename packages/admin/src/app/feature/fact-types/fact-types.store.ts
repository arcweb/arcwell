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
import { ToastService } from '@app/shared/services/toast.service';
import { ToastLevel } from '@app/shared/models/toast-message.model';

interface FactTypesState {
  factTypes: FactTypeModel[];
  limit: number;
  offset: number;
  totalData: number;
  pageIndex: number;
  sort: string;
  order: SortDirection;
  search: { field: string; searchString: string }[];
  csv?: Blob;
}

const initialState: FactTypesState = {
  factTypes: [],
  limit: 10,
  offset: 0,
  totalData: 0,
  pageIndex: 0,
  sort: 'name',
  order: 'asc',
  search: [],
  csv: undefined,
};

export const FactTypesStore = signalStore(
  withDevtools('factTypes'),
  withState(initialState),
  withRequestStatus(),
  withMethods(
    (
      store,
      factTypesService = inject(FactTypeService),
      toastService = inject(ToastService),
    ) => ({
      async load(props: {
        limit: number;
        offset: number;
        sort?: string;
        order?: SortDirection;
        pageIndex?: number;
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
        const resp = await firstValueFrom(factTypesService.getFactTypes(props));
        if (resp.errors) {
          patchState(store, setErrors(resp.errors));

          toastService.sendMessage(
            toastService.createCrudMessage('Fact Types', 'Fetching', false),
            ToastLevel.ERROR,
          );
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
          factTypesService.getFactTypes({
            limit: store.limit(),
            offset: store.offset(),
            search: store.search(),
          }),
        );

        if (resp.errors) {
          patchState(store, setErrors(resp.errors));

          toastService.sendMessage(
            toastService.createCrudMessage('Fact Types', 'Fetching', false),
            ToastLevel.ERROR,
          );
        } else {
          patchState(
            store,
            { factTypes: resp.data, totalData: resp.meta.count },
            setFulfilled(),
          );
        }
      },
      async getCsv() {
        patchState(store, setPending());
        const resp = await firstValueFrom(factTypesService.getCsv());
        if (resp.errors || Object.keys(resp).includes('errors')) {
          patchState(store, setErrors(resp.errors));

          toastService.sendMessage(
            toastService.createCrudMessage('Fact Type CSV', 'Fetching', false),
            ToastLevel.ERROR,
          );
        } else {
          const blob = new Blob([resp], { type: 'text/csv' });
          const data = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = data;
          link.download = `Fact_Types.csv`;
          link.click();
          patchState(store, { csv: resp }, setFulfilled());
        }
      },
    }),
  ),
  withHooks({
    onInit(store) {
      store.load({ limit: store.limit(), offset: store.offset() });
    },
  }),
);
