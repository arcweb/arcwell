import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { BulkService } from '@app/shared/services/bulk.service';
import {
  setErrors,
  setFulfilled,
  setPending,
  withRequestStatus,
} from '@shared/store/request-status.feature';
import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ToastService } from '../services/toast.service';
import { ToastLevel } from '../models';

export type UploadStatus = 'none' | 'pending' | 'success' | 'error';

interface BulkState {
  uploadStatus: UploadStatus;
}

const initialState: BulkState = {
  uploadStatus: 'none',
};

export const BulkStore = signalStore(
  { providedIn: 'root' },
  withDevtools('bulk'),
  withState(initialState),
  withRequestStatus(),
  withMethods(
    (
      store,
      bulkService = inject(BulkService),
      toastService = inject(ToastService),
    ) => ({
      async uploadCSV(apiRoute: string, file: File) {
        patchState(store, { ...initialState }, setPending());
        const resp = await firstValueFrom(
          bulkService.uploadCsv(apiRoute, file),
        );
        if (resp.errors) {
          patchState(store, { uploadStatus: 'error' }, setErrors(resp.errors));

          toastService.sendMessage(
            `Failed to upload CSV data to ${apiRoute}`,
            ToastLevel.ERROR,
          );
        } else {
          patchState(store, setFulfilled());
          toastService.sendMessage(
            `Upload to ${apiRoute} complete`,
            ToastLevel.SUCCESS,
          );
        }
      },
    }),
  ),
);
