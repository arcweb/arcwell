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
import { SortDirection } from '@angular/material/sort';
import { isRelationLastOnPage } from '@app/shared/helpers/store.helper';

interface CohortPeopleListState {
  limit: number;
  offset: number;
  pageIndex: number;
  sort: string;
  order: SortDirection;
}

interface CohortState {
  cohort: CohortType | null;
  inEditMode: boolean;
  inCreateMode: boolean;
  isReady: boolean;
  peopleListOptions: CohortPeopleListState;
}

const initialPeopleListState: CohortPeopleListState = {
  limit: 10,
  offset: 0,
  pageIndex: 0,
  sort: 'familyName',
  order: 'asc',
};

const initialState: CohortState = {
  cohort: null,
  inEditMode: false,
  inCreateMode: false,
  isReady: false,
  peopleListOptions: initialPeopleListState,
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
        const cohortResp = await firstValueFrom(
          cohortService.getCohortWithPeople(
            cohortId,
            store.peopleListOptions().limit,
            store.peopleListOptions().offset,
            store.peopleListOptions().sort,
            store.peopleListOptions().order,
          ),
        );
        if (cohortResp.errors) {
          patchState(store, { isReady: true }, setErrors(cohortResp.errors));
        } else {
          patchState(
            store,
            {
              cohort: cohortResp.data,
              isReady: true,
              peopleListOptions: initialPeopleListState,
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
            peopleListOptions: initialPeopleListState,
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
            {
              cohort: resp.data,
              inEditMode: false,
              peopleListOptions: initialPeopleListState,
            },
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
            {
              cohort: resp.data,
              inCreateMode: false,
              inEditMode: false,
              peopleListOptions: initialPeopleListState,
            },
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
          patchState(
            store,
            { inEditMode: false, peopleListOptions: initialPeopleListState },
            setFulfilled(),
          );
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
      async loadPeoplePage(
        limit: number,
        offset: number,
        pageIndex: number,
        sort: string,
        order: SortDirection,
      ) {
        patchState(
          store,
          {
            peopleListOptions: {
              ...initialPeopleListState,
              offset,
              pageIndex,
              limit,
              sort,
              order,
            },
          },
          setPending(),
        );
        const resp = await firstValueFrom(
          cohortService.getCohortWithPeople(
            store.cohort().id,
            store.peopleListOptions().limit,
            store.peopleListOptions().offset,
            store.peopleListOptions().sort,
            store.peopleListOptions().order,
          ),
        );

        if (resp.errors) {
          patchState(store, setErrors(resp.errors));
        } else {
          patchState(
            store,
            {
              cohort: resp.data,
              isReady: true,
            },
            setFulfilled(),
          );
        }
      },
      async attachPerson(personId: string) {
        patchState(store, setPending());
        const resp = await firstValueFrom(
          cohortService.attachPerson(store.cohort().id, personId),
        );
        if (resp && resp.errors) {
          patchState(store, setErrors(resp.errors));
        } else {
          this.loadPeoplePage(
            store.peopleListOptions().limit,
            store.peopleListOptions().offset,
            store.peopleListOptions().pageIndex,
            store.peopleListOptions().sort,
            store.peopleListOptions().order,
          );
          toastService.sendMessage(
            'Person added to cohort',
            ToastLevel.SUCCESS,
          );
        }
      },
      async detachPerson(personId: string) {
        patchState(store, setPending());
        const resp = await firstValueFrom(
          cohortService.detachPerson(store.cohort().id, personId),
        );
        if (resp && resp.errors) {
          patchState(store, setErrors(resp.errors));
        } else {
          const isLastPersonOnPage = isRelationLastOnPage(
            store.cohort().peopleCount,
            store.peopleListOptions().limit,
            store.peopleListOptions().pageIndex,
            store.peopleListOptions().offset,
          );
          // Go to previous page if last person in page other than final one
          const pageIndex = isLastPersonOnPage
            ? store.peopleListOptions().pageIndex - 1
            : store.peopleListOptions().pageIndex;
          const offset = isLastPersonOnPage
            ? store.peopleListOptions().offset - store.peopleListOptions().limit
            : store.peopleListOptions().offset;

          this.loadPeoplePage(
            store.peopleListOptions().limit,
            offset,
            pageIndex,
            store.peopleListOptions().sort,
            store.peopleListOptions().order,
          );
          toastService.sendMessage(
            'Person removed from cohort',
            ToastLevel.SUCCESS,
          );
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
