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
import { firstValueFrom, forkJoin } from 'rxjs';
import { CohortType, CohortUpdateType } from '@shared/schemas/cohort.schema';
import { TagType } from '@schemas/tag.schema';
import { TagService } from '@shared/services/tag.service';
import { ToastService } from '@shared/services/toast.service';
import { ToastLevel } from '@shared/models';
import { SortDirection } from '@angular/material/sort';
import { isRelationLastOnPage } from '@app/shared/helpers/store.helper';
import { Router } from '@angular/router';
import { PersonTypeType } from '@app/shared/schemas/person-type.schema';
import { PersonTypeService } from '@app/shared/services/person-type.service';

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
  personTypes: PersonTypeType[];
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
  personTypes: [],
};

export const CohortStore = signalStore(
  withDevtools('cohort'),
  withState(initialState),
  withRequestStatus(),
  withMethods(
    (
      store,
      cohortService = inject(CohortService),
      personTypeService = inject(PersonTypeService),
      tagService = inject(TagService),
      toastService = inject(ToastService),
      router = inject(Router),
    ) => ({
      async initialize(cohortId: string) {
        patchState(store, setPending());
        const { cohortResp, personTypesResp } = await firstValueFrom(
          forkJoin({
            cohortResp: cohortService.getCohortWithPeople({
              id: cohortId,
              limit: store.peopleListOptions().limit,
              offset: store.peopleListOptions().offset,
              sort: store.peopleListOptions().sort,
              order: store.peopleListOptions().order,
            }),
            personTypesResp: personTypeService.getPersonTypes({}),
          }),
        );
        if (cohortResp.errors) {
          patchState(store, { isReady: true }, setErrors(cohortResp.errors));
        } else if (personTypesResp.errors) {
          patchState(
            store,
            { isReady: true },
            setErrors(personTypesResp.errors),
          );
        } else {
          patchState(
            store,
            {
              cohort: cohortResp.data,
              personTypes: personTypesResp.data,
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

        const { cohortResp, personTypesResp } = await firstValueFrom(
          forkJoin({
            cohortResp: cohortService.create(createCohortFormData),
            personTypesResp: personTypeService.getPersonTypes({}),
          }),
        );
        if (cohortResp.errors) {
          patchState(store, { isReady: true }, setErrors(cohortResp.errors));
        } else if (personTypesResp.errors) {
          patchState(
            store,
            { isReady: true },
            setErrors(personTypesResp.errors),
          );
        } else {
          patchState(
            store,
            {
              cohort: cohortResp.data,
              personTypes: personTypesResp.data,
              inCreateMode: false,
              inEditMode: false,
              peopleListOptions: initialPeopleListState,
            },
            setFulfilled(),
          );

          toastService.sendMessage('Created cohort.', ToastLevel.SUCCESS);

          // navigate to the newly created cohort and don't save the current route in history
          router.navigateByUrl(`/cohorts/${cohortResp.data.id}`, {
            replaceUrl: true,
          });
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
      async loadPeoplePage(props: {
        limit: number;
        offset: number;
        pageIndex: number;
        sort: string;
        order: SortDirection;
      }) {
        patchState(
          store,
          {
            peopleListOptions: {
              ...initialPeopleListState,
              ...props,
            },
          },
          setPending(),
        );
        const resp = await firstValueFrom(
          cohortService.getCohortWithPeople({
            id: store.cohort().id,
            limit: store.peopleListOptions().limit,
            offset: store.peopleListOptions().offset,
            sort: store.peopleListOptions().sort,
            order: store.peopleListOptions().order,
          }),
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
          this.loadPeoplePage({
            limit: store.peopleListOptions().limit,
            offset: store.peopleListOptions().offset,
            pageIndex: store.peopleListOptions().pageIndex,
            sort: store.peopleListOptions().sort,
            order: store.peopleListOptions().order,
          });
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

          this.loadPeoplePage({
            limit: store.peopleListOptions().limit,
            offset: offset,
            pageIndex: pageIndex,
            sort: store.peopleListOptions().sort,
            order: store.peopleListOptions().order,
          });
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
