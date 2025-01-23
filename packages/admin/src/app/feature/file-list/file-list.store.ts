import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import {
  withRequestStatus,
  setPending,
  setFulfilled,
  setErrors,
} from '@shared/store/request-status.feature';
import { inject } from '@angular/core';
import { firstValueFrom, forkJoin } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { SortDirection } from '@angular/material/sort';
import { ToastService } from '@app/shared/services/toast.service';
import { ToastLevel } from '@app/shared/models';
import { FileModel } from '@app/shared/models/file.model';
import { FileService } from '@app/shared/services/file.service';
import { FileTypeService } from '@app/shared/services/file-type.service';
import { FileTypeType } from '@app/shared/schemas/file-type.schema';

interface FilesListState {
  files: FileModel[];
  fileTypes: FileTypeType[];
  limit: number;
  offset: number;
  totalData: number;
  pageIndex: number;
  sort: string;
  order: SortDirection;
  typeKey: string;
}

const initialState: FilesListState = {
  files: [],
  fileTypes: [],
  limit: 10,
  offset: 0,
  totalData: 0,
  pageIndex: 0,
  sort: 'familyName',
  order: 'asc',
  typeKey: '',
};

export const FilesListStore = signalStore(
  withDevtools('files'),
  withState(initialState),
  withRequestStatus(),
  withMethods(
    (
      store,
      fileService = inject(FileService),
      fileTypeService = inject(FileTypeService),
      toastService = inject(ToastService),
    ) => ({
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
        const { filesResp, fileTypesResp } = await firstValueFrom(
          forkJoin({
            filesResp: fileService.getFiles(props),
            fileTypesResp: fileTypeService.getFileTypes({}),
          }),
        );
        if (filesResp.errors) {
          patchState(store, setErrors(filesResp.errors));

          toastService.sendMessage(
            toastService.createCrudMessage('Files', 'Fetching', false),
            ToastLevel.ERROR,
          );
        } else if (fileTypesResp.errors) {
          patchState(store, setErrors(fileTypesResp.errors));

          toastService.sendMessage(
            toastService.createCrudMessage('File Types', 'Fetching', false),
            ToastLevel.ERROR,
          );
        } else {
          patchState(
            store,
            {
              files: filesResp.data,
              totalData: filesResp.meta.count,
              fileTypes: fileTypesResp.data,
            },
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
          fileService.getFiles({
            limit: store.limit(),
            offset: store.offset(),
            typeKey: store.typeKey(),
          }),
        );

        if (resp.errors) {
          patchState(store, setErrors(resp.errors));

          toastService.sendMessage(
            toastService.createCrudMessage('Files', 'Fetching', false),
            ToastLevel.ERROR,
          );
        } else {
          patchState(
            store,
            { files: resp.data, totalData: resp.meta.count },
            setFulfilled(),
          );
        }
      },
      async count() {
        patchState(store, setPending());
        const resp = await firstValueFrom(fileService.count());
        if (resp.errors) {
          patchState(store, setErrors(resp.errors));

          toastService.sendMessage(
            toastService.createCrudMessage('Files Count', 'Fetching', false),
            ToastLevel.ERROR,
          );
        } else {
          patchState(store, { totalData: resp.data.count }, setFulfilled());
        }
      },
    }),
  ),
);
