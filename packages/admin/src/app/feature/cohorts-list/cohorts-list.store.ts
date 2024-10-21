import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import {
  withRequestStatus,
  setPending,
  setFulfilled,
  setErrors,
} from '@shared/store/request-status.feature';
import { CohortService } from '@shared/services/cohort.service';
import { inject } from '@angular/core';
import { CohortModel } from '@shared/models/cohort.model';
import { firstValueFrom } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { ToastService } from '@app/shared/services/toast.service';
import { ToastLevel } from '@app/shared/models';

interface CohortsListState {
  cohorts: CohortModel[];
  limit: number;
  offset: number;
  totalData: number;
  pageIndex: number;
}

const initialState: CohortsListState = {
  cohorts: [],
  limit: 10,
  offset: 0,
  totalData: 0,
  pageIndex: 0,
};

export const CohortsListStore = signalStore(
  withDevtools('cohorts'),
  withState(initialState),
  withRequestStatus(),
  withMethods(
    (
      store,
      cohortService = inject(CohortService),
      toastService = inject(ToastService),
    ) => ({
      async load(limit: number, offset: number) {
        patchState(store, { ...initialState }, setPending());
        const resp = await firstValueFrom(
          cohortService.getCohorts({ limit: limit, offset: offset }),
        );
        if (resp.errors) {
          patchState(store, setErrors(resp.errors));

          toastService.sendMessage(
            toastService.createCrudMessage('Cohort', 'Fetching', false),
            ToastLevel.ERROR,
          );
        } else {
          patchState(
            store,
            { cohorts: resp.data, totalData: resp.meta.count },
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
          cohortService.getCohorts({
            limit: store.limit(),
            offset: store.offset(),
          }),
        );

        if (resp.errors) {
          patchState(store, setErrors(resp.errors));

          toastService.sendMessage(
            toastService.createCrudMessage('Cohort', 'Fetching', false),
            ToastLevel.ERROR,
          );
        } else {
          patchState(
            store,
            { cohorts: resp.data, totalData: resp.meta.count },
            setFulfilled(),
          );
        }
      },
    }),
  ),
);
