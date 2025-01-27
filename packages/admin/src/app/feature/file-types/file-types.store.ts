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

import { FileTypeService } from '@shared/services/file-type.service';
import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { FileTypeModel } from '@app/shared/models/file-type.model';
import { PageEvent } from '@angular/material/paginator';
import { SortDirection } from '@angular/material/sort';
import { ToastService } from '@app/shared/services/toast.service';
import { ToastLevel } from '@app/shared/models/toast-message.model';

interface FileTypesState {
  fileTypes: FileTypeModel[];
  limit: number;
  offset: number;
  totalData: number;
  pageIndex: number;
  sort: string;
  order: SortDirection;
  search: { field: string; searchString: string }[];
}

const initialState: FileTypesState = {
  fileTypes: [],
  limit: 10,
  offset: 0,
  totalData: 0,
  pageIndex: 0,
  sort: 'name',
  order: 'asc',
  search: [],
};

export const FileTypesStore = signalStore(
  withDevtools('fileTypes'),
  withState(initialState),
  withRequestStatus(),
  withMethods(
    (
      store,
      fileTypesService = inject(FileTypeService),
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
        const resp = await firstValueFrom(fileTypesService.getFileTypes(props));
        if (resp.errors) {
          patchState(store, setErrors(resp.errors));

          toastService.sendMessage(
            toastService.createCrudMessage('File Types', 'Fetching', false),
            ToastLevel.ERROR,
          );
        } else {
          patchState(
            store,
            { fileTypes: resp.data, totalData: resp.meta.count },
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
          fileTypesService.getFileTypes({
            limit: store.limit(),
            offset: store.offset(),
            search: store.search(),
          }),
        );

        if (resp.errors) {
          patchState(store, setErrors(resp.errors));

          toastService.sendMessage(
            toastService.createCrudMessage('File Types', 'Fetching', false),
            ToastLevel.ERROR,
          );
        } else {
          patchState(
            store,
            { fileTypes: resp.data, totalData: resp.meta.count },
            setFulfilled(),
          );
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
