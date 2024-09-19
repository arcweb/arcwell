import {
  patchState,
  signalStore,
  withComputed,
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
import { CohortService } from '@shared/services/cohort.service';
import { computed, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CohortType, CohortUpdateType } from '@shared/schemas/cohort.schema';
import { TagType } from '@schemas/tag.schema';
import { TagService } from '@shared/services/tag.service';
import { ToastService } from '@shared/services/toast.service';
import { ToastLevel } from '@shared/models';

interface CohortState {
  cohort: CohortType | null;
  inEditMode: boolean;
  inCreateMode: boolean;
  isReady: boolean;
}

const initialState: CohortState = {
  cohort: null,
  inEditMode: false,
  inCreateMode: false,
  isReady: false,
};

export const CohortStore = signalStore(
  withDevtools('cohort'),
  withState(initialState),
  withRequestStatus(),
  withMethods(
    (
      store,
      cohortService = inject(CohortService),
      tagService = inject(TagService),
      toastService = inject(ToastService),
    ) => ({
      async initialize(cohortId: string) {
        patchState(store, setPending());
        const cohortResp = await firstValueFrom(cohortService.getCohort(cohortId));
        if (cohortResp.errors) {
          patchState(store, { isReady: true }, setErrors(cohortResp.errors));
        } else {
          patchState(
            store,
            {
              cohort: cohortResp.data,
              isReady: true,
            },
            setFulfilled(),
          );
        }
      },
      async initializeForCreate() {
        patchState(store, setPending());
        patchState(
          store,
          {
            inCreateMode: true,
            inEditMode: true,
            isReady: true,
          },
          setFulfilled(),
        );
      },
      async toggleEditMode() {
        patchState(store, { inEditMode: !store.inEditMode() });
      },
      async updateCohort(updateCohortFormData: CohortUpdateType) {
        patchState(store, setPending());
        updateCohortFormData.id = store.cohort().id;
        const resp = await firstValueFrom(
          cohortService.update(updateCohortFormData),
        );
        if (resp.errors) {
          patchState(store, setErrors(resp.errors));
        } else {
          patchState(
            store,
            { cohort: resp.data, inEditMode: false },
            setFulfilled(),
          );
          toastService.sendMessage('Updated cohort.', ToastLevel.SUCCESS);
        }
      },
      async createCohort(createCohortFormData: CohortType) {
        console.log('createCohortFormData', createCohortFormData);
        patchState(store, setPending());

        const resp = await firstValueFrom(
          cohortService.create(createCohortFormData),
        );
        if (resp.errors) {
          patchState(store, setErrors(resp.errors));
        } else {
          // TODO: Do we need to do this if we are navigating away?
          patchState(
            store,
            { cohort: resp.data, inEditMode: false },
            setFulfilled(),
          );
        }
      },
      async deleteCohort() {
        patchState(store, setPending());
        const resp = await firstValueFrom(
          cohortService.delete(store.cohort().id),
        );
        if (resp && resp.errors) {
          patchState(store, setErrors(resp.errors));
        } else {
          patchState(store, { inEditMode: false }, setFulfilled());
        }
      },
      async setTags(tags: string[]) {
        patchState(store, setPending());
        const resp = await firstValueFrom(
          tagService.setTags(store.cohort().id, 'cohorts', tags),
        );
        if (resp && resp.errors) {
          patchState(store, setErrors(resp.errors));
        } else {
          patchState(store, setFulfilled());
        }
      },
    }),
  ),
  withComputed(({ cohort }) => ({
    tagStrings: computed(
      () => cohort()?.tags?.map((tag: TagType) => tag.pathname) ?? [],
    ),
  })),
);
