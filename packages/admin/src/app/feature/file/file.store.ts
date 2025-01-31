import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { computed, inject } from '@angular/core';
import { ToastLevel } from '@app/shared/models';
import { DimensionType } from '@app/shared/schemas/dimension.schema';
import { FileTypeType } from '@app/shared/schemas/file-type.schema';
import { FileType, FileUpdateType } from '@app/shared/schemas/file.schema';
import { FileTypeService } from '@app/shared/services/file-type.service';
import { FileService } from '@app/shared/services/file.service';
import { RefreshService } from '@app/shared/services/refresh.service';
import { ToastService } from '@app/shared/services/toast.service';
import {
  setErrors,
  setFulfilled,
  setPending,
  withRequestStatus,
} from '@app/shared/store/request-status.feature';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { firstValueFrom, forkJoin } from 'rxjs';
import { DetailStore } from '@feature/detail/detail.store';

export type FileStatus = 'none' | 'pending' | 'success' | 'error';

interface FileState {
  file: FileType | null;
  dimensionsCopy: DimensionType[] | [];
  fileTypes: FileTypeType[];
  isReady: boolean;
  inEditMode: boolean;
  inCreateMode: boolean;
  uploadStatus?: FileStatus;
  downloadUrl?: string;
  downloadStatus?: FileStatus;
}

const initialState: FileState = {
  file: null,
  dimensionsCopy: [],
  fileTypes: [],
  isReady: false,
  inEditMode: false,
  inCreateMode: false,
  uploadStatus: 'none',
  downloadUrl: undefined,
  downloadStatus: 'none',
};

export const FileStore = signalStore(
  withDevtools('file'),
  withState(initialState),
  withRequestStatus(),
  withMethods(
    (
      store,
      fileService = inject(FileService),
      fileTypeService = inject(FileTypeService),
      toastService = inject(ToastService),
      refreshService = inject(RefreshService),
      detailStore = inject(DetailStore),
    ) => ({
      async initialize(fileId: string) {
        patchState(store, { ...initialState }, setPending());
        const { fileResponse, filetypesResponse } = await firstValueFrom(
          forkJoin({
            fileResponse: fileService.getFile(fileId),
            filetypesResponse: fileTypeService.getFileTypes({}),
          }),
        );
        if (fileResponse.errors) {
          patchState(
            store,
            { uploadStatus: 'error' },
            setErrors(fileResponse.errors),
          );

          toastService.sendMessage(
            `Failed to get file ${fileId}`,
            ToastLevel.ERROR,
          );
        } else if (filetypesResponse.errors) {
          patchState(
            store,
            { uploadStatus: 'error' },
            setErrors(filetypesResponse.errors),
          );

          toastService.sendMessage(
            `Failed to get file types`,
            ToastLevel.ERROR,
          );
        } else {
          patchState(
            store,
            {
              file: fileResponse.data,
              fileTypes: filetypesResponse.data,
              isReady: true,
            },
            setFulfilled(),
          );
        }
      },
      async uploadFile(name: string, type: any, file: File) {
        patchState(store, { ...initialState }, setPending());
        const resp = await firstValueFrom(
          fileService.uploadFile(name, file, type),
        );
        if (resp.errors) {
          patchState(store, { uploadStatus: 'error' }, setErrors(resp.errors));

          toastService.sendMessage(`Failed to upload file`, ToastLevel.ERROR);
        } else {
          patchState(
            store,
            { file: resp.data, inEditMode: false, inCreateMode: false },
            setFulfilled(),
          );
          toastService.sendMessage(`File uploaded`, ToastLevel.SUCCESS);
          // refresh the list
          refreshService.triggerRefresh();
          // navigate to the new item
          detailStore.routeToNewDetailId(resp.data.id);
        }
      },
      async initializeForCreate() {
        patchState(store, { ...initialState }, setPending());
        const fileTypesResponse = await firstValueFrom(
          fileTypeService.getFileTypes({}),
        );
        if (fileTypesResponse.errors) {
          patchState(
            store,
            { uploadStatus: 'error' },
            setErrors(fileTypesResponse.errors),
          );

          toastService.sendMessage(
            `Failed to get file types`,
            ToastLevel.ERROR,
          );
        } else {
          patchState(
            store,
            {
              fileTypes: fileTypesResponse.data,
              isReady: true,
              inCreateMode: true,
              inEditMode: true,
            },
            setFulfilled(),
          );
        }
      },
      async toggleEditMode() {
        patchState(store, { inEditMode: !store.inEditMode() });
      },
      async downloadFile() {
        patchState(store, { downloadStatus: 'pending' }, setPending());
        console.log('DOWNLOADING FILE', store.file().id);
        const resp = await firstValueFrom(
          fileService.downloadFile(store.file().id),
        );
        if (resp.errors) {
          patchState(
            store,
            { downloadStatus: 'error' },
            setErrors(resp.errors),
          );

          toastService.sendMessage(
            `Failed to download file ${store.file().fileId}`,
            ToastLevel.ERROR,
          );
        } else {
          patchState(
            store,
            { downloadUrl: resp.data, downloadStatus: 'success' },
            setFulfilled(),
          );
          toastService.sendMessage(
            `File ${store.file().fileId} downloaded`,
            ToastLevel.SUCCESS,
          );
        }
      },

      async getFile(fileId: string) {
        patchState(store, { ...initialState }, setPending());
        const resp = await firstValueFrom(fileService.getFile(fileId));
        if (resp.errors) {
          patchState(store, { uploadStatus: 'error' }, setErrors(resp.errors));
          console.log('FILE RESPONSE ERRORS', resp.errors);

          toastService.sendMessage(
            `Failed to get file ${fileId}`,
            ToastLevel.ERROR,
          );
        } else {
          patchState(store, { file: resp.data }, setFulfilled());
          toastService.sendMessage(
            `File ${fileId} retrieved`,
            ToastLevel.SUCCESS,
          );
        }
      },

      async updateFile(file: FileUpdateType) {
        patchState(store, setPending());
        file.id = store.file().id;
        const resp = await firstValueFrom(fileService.updateFile(file));
        if (resp.errors) {
          patchState(store, { uploadStatus: 'error' }, setErrors(resp.errors));

          toastService.sendMessage(
            `Failed to update file ${file.id}`,
            ToastLevel.ERROR,
          );
        } else {
          patchState(
            store,
            { file: resp.data, inEditMode: false },
            setFulfilled(),
          );
          toastService.sendMessage(
            `File ${file.id} updated`,
            ToastLevel.SUCCESS,
          );
          // refresh the list
          refreshService.triggerRefresh();
        }
      },

      async deleteFile() {
        patchState(store, setPending());
        const resp = await firstValueFrom(
          fileService.deleteFile(store.file().id),
        );
        if (resp && resp.errors) {
          patchState(store, { uploadStatus: 'error' }, setErrors(resp.errors));

          toastService.sendMessage(
            `Failed to delete file ${store.file().id}`,
            ToastLevel.ERROR,
          );
        } else {
          patchState(store, { file: null }, setFulfilled());
          toastService.sendMessage(`File deleted`, ToastLevel.SUCCESS);
          // refresh the list
          refreshService.triggerRefresh();
          // navigate to the list
          detailStore.clearDetailId();
        }
      },
    }),
  ),
  withComputed(({ file }) => ({
    tagStrings: computed(() => file()?.tags?.map((tag: string) => tag) ?? []),
  })),
);
