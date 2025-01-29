import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { inject } from '@angular/core';
import { ToastLevel } from '@app/shared/models';
import { DimensionType } from '@app/shared/schemas/dimension.schema';
import { FileTypeType } from '@app/shared/schemas/file-type.schema';
import { FileType } from '@app/shared/schemas/file.schema';
import { FileTypeService } from '@app/shared/services/file-type.service';
import { FileService } from '@app/shared/services/file.service';
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
  type,
  withMethods,
  withState,
} from '@ngrx/signals';
import { async, firstValueFrom, forkJoin } from 'rxjs';
import { string, any } from 'zod';

export type UploadStatus = 'none' | 'pending' | 'success' | 'error';

interface FileState {
  file: FileType | null;
  dimensionsCopy: DimensionType[] | [];
  filetypes: FileTypeType[];
  isReady: boolean;
  inEditMode: boolean;
  inCreateMode: boolean;
  uploadStatus?: UploadStatus;
}

const initialState: FileState = {
  file: null,
  dimensionsCopy: [],
  filetypes: [],
  isReady: false,
  inEditMode: false,
  inCreateMode: false,
  uploadStatus: 'none',
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
              filetypes: filetypesResponse.data,
              isReady: true,
            },
            setFulfilled(),
          );
        }
      },
      async uploadFile(apiRoute: string, type: any, file: File) {
        patchState(store, { ...initialState }, setPending());
        const resp = await firstValueFrom(fileService.uploadFile(file, type));
        if (resp.errors) {
          patchState(store, { uploadStatus: 'error' }, setErrors(resp.errors));

          toastService.sendMessage(
            `Failed to upload file to ${apiRoute}`,
            ToastLevel.ERROR,
          );
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
              filetypes: fileTypesResponse.data,
              isReady: true,
              inCreateMode: true,
            },
            setFulfilled(),
          );
        }
      },
      async toggleEditMode() {
        patchState(store, { inEditMode: !store.inEditMode() });
      },
      async downloadFile(fileId: string) {
        patchState(store, { ...initialState }, setPending());
        const resp = await firstValueFrom(fileService.downloadFile(fileId));
        if (resp.errors) {
          patchState(store, { uploadStatus: 'error' }, setErrors(resp.errors));

          toastService.sendMessage(
            `Failed to download file ${fileId}`,
            ToastLevel.ERROR,
          );
        }
      },

      async getFile(fileId: string) {
        patchState(store, { ...initialState }, setPending());
        const resp = await firstValueFrom(fileService.getFile(fileId));
        if (resp.errors) {
          patchState(store, { uploadStatus: 'error' }, setErrors(resp.errors));

          toastService.sendMessage(
            `Failed to get file ${fileId}`,
            ToastLevel.ERROR,
          );
        }
      },
    }),
  ),
);
