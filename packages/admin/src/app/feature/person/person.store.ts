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
import { PersonService } from '@shared/services/person.service';
import { computed, inject } from '@angular/core';
import { firstValueFrom, forkJoin } from 'rxjs';
import { PersonType, PersonUpdateType } from '@shared/schemas/person.schema';
import { PersonTypeService } from '@shared/services/person-type.service';
import { PersonTypeType } from '@schemas/person-type.schema';
import { TagService } from '@shared/services/tag.service';
import { ToastService } from '@shared/services/toast.service';
import { ToastLevel } from '@shared/models';
import { isRelationLastOnPage } from '@app/shared/helpers/store.helper';
import { RefreshService } from '@app/shared/services/refresh.service';
import { DetailStore } from '@feature/detail/detail.store';
import { DimensionType } from '@schemas/dimension.schema';
import { convertDimensionDataTypeValues } from '@shared/helpers/dimension.helper';

interface PersonCohortsListState {
  limit: number;
  offset: number;
  pageIndex: number;
}

interface PersonState {
  person: PersonType | null;
  dimensionsCopy: DimensionType[] | [];
  personTypes: PersonTypeType[];
  inEditMode: boolean;
  inCreateMode: boolean;
  isReady: boolean;
  cohortsListOptions: PersonCohortsListState;
}

const initialCohortsListState: PersonCohortsListState = {
  limit: 10,
  offset: 0,
  pageIndex: 0,
};

const initialState: PersonState = {
  person: null,
  dimensionsCopy: [],
  personTypes: [],
  inEditMode: false,
  inCreateMode: false,
  isReady: false,
  cohortsListOptions: initialCohortsListState,
};

export const PersonStore = signalStore(
  withDevtools('person'),
  withState(initialState),
  withRequestStatus(),
  withMethods(
    (
      store,
      personService = inject(PersonService),
      personTypeService = inject(PersonTypeService),
      tagService = inject(TagService),
      toastService = inject(ToastService),
      detailStore = inject(DetailStore),
      refreshService = inject(RefreshService),
    ) => ({
      async initialize(personId: string) {
        patchState(store, setPending());
        const { personResp, personTypesResp } = await firstValueFrom(
          forkJoin({
            personResp: personService.getPersonWithCohorts(
              personId,
              store.cohortsListOptions().limit,
              store.cohortsListOptions().offset,
            ),
            personTypesResp: personTypeService.getPersonTypes({}),
          }),
        );
        if (personResp.errors) {
          patchState(store, { isReady: true }, setErrors(personResp.errors));

          toastService.sendMessage(
            toastService.createCrudMessage('Person', 'Fetching', false),
            ToastLevel.ERROR,
          );
        } else if (personTypesResp.errors) {
          patchState(
            store,
            { isReady: true },
            setErrors(personTypesResp.errors),
          );

          toastService.sendMessage(
            toastService.createCrudMessage('Person Type', 'Fetching', false),
            ToastLevel.ERROR,
          );
        } else {
          const dimensionsCopy = personResp.data.dimensions?.slice() ?? [];
          patchState(
            store,
            {
              person: personResp.data,
              dimensionsCopy: dimensionsCopy,
              personTypes: personTypesResp.data,
              isReady: true,
              cohortsListOptions: initialCohortsListState,
            },
            setFulfilled(),
          );
        }
      },
      async initializeForCreate() {
        patchState(store, setPending());
        const personTypesResp = await firstValueFrom(
          personTypeService.getPersonTypes({}),
        );
        if (personTypesResp.errors) {
          patchState(
            store,
            { isReady: true },
            setErrors(personTypesResp.errors),
          );

          toastService.sendMessage(
            toastService.createCrudMessage('Person Type', 'Fetching', false),
            ToastLevel.ERROR,
          );
        } else {
          patchState(
            store,
            {
              personTypes: personTypesResp.data,
              inCreateMode: true,
              inEditMode: true,
              isReady: true,
              cohortsListOptions: initialCohortsListState,
            },
            setFulfilled(),
          );
        }
      },
      async toggleEditMode() {
        patchState(store, { inEditMode: !store.inEditMode() });
      },
      async updatePerson(updatePersonFormData: PersonUpdateType) {
        patchState(store, setPending());
        updatePersonFormData.id = store.person().id;
        if (
          updatePersonFormData.personType &&
          updatePersonFormData.personType.id
        ) {
          updatePersonFormData.typeKey = updatePersonFormData.personType.key;
        }

        const newPerson = convertDimensionDataTypeValues(
          updatePersonFormData,
          'personType',
        );

        const resp = await firstValueFrom(personService.update(newPerson));
        if (resp.errors) {
          patchState(store, setErrors(resp.errors));

          toastService.sendMessage(
            toastService.createCrudMessage('Person', 'Updating', false),
            ToastLevel.ERROR,
          );
        } else {
          patchState(
            store,
            {
              person: resp.data,
              inEditMode: false,
              cohortsListOptions: initialCohortsListState,
            },
            setFulfilled(),
          );

          toastService.sendMessage(
            toastService.createCrudMessage('Person', 'Updated'),
            ToastLevel.SUCCESS,
          );

          // refresh the list
          refreshService.triggerRefresh();
        }
      },
      async createPerson(createPersonFormData: PersonType) {
        patchState(store, setPending());
        createPersonFormData.typeKey = createPersonFormData.personType.key;

        const newPerson = convertDimensionDataTypeValues(
          createPersonFormData,
          'personType',
        );

        const resp = await firstValueFrom(personService.create(newPerson));
        if (resp.errors) {
          patchState(store, setErrors(resp.errors));

          toastService.sendMessage(
            toastService.createCrudMessage('Person', 'Creating', false),
            ToastLevel.ERROR,
          );
        } else {
          patchState(
            store,
            {
              person: resp.data,
              inCreateMode: false,
              inEditMode: false,
              cohortsListOptions: initialCohortsListState,
            },
            setFulfilled(),
          );

          toastService.sendMessage(
            toastService.createCrudMessage('Person', 'Created'),
            ToastLevel.SUCCESS,
          );

          // refresh the list
          refreshService.triggerRefresh();
          // navigate the user to the newly created item
          detailStore.routeToNewDetailId(resp.data.id);
        }
      },
      async deletePerson() {
        patchState(store, setPending());
        const resp = await firstValueFrom(
          personService.delete(store.person().id),
        );
        if (resp && resp.errors) {
          patchState(store, setErrors(resp.errors));

          toastService.sendMessage(
            toastService.createCrudMessage('Person', 'Deleting', false),
            ToastLevel.ERROR,
          );
        } else {
          patchState(
            store,
            { inEditMode: false, cohortsListOptions: initialCohortsListState },
            setFulfilled(),
          );

          toastService.sendMessage(
            toastService.createCrudMessage('Person', 'Deleted'),
            ToastLevel.SUCCESS,
          );

          // refresh the list
          refreshService.triggerRefresh();
          // clear the detail_id to close the drawer
          detailStore.clearDetailId();
        }
      },
      async setDimensions(index: number, dimension: DimensionType) {
        const newDimensions = store.dimensionsCopy().slice();

        if (index === -1) {
          newDimensions.push(dimension);
        } else {
          newDimensions[index] = dimension;
        }
        patchState(store, {
          dimensionsCopy: newDimensions,
        });
      },
      async resetDimensions() {
        const newDimensions = store.person().dimensions.slice();
        patchState(store, {
          dimensionsCopy: newDimensions,
        });
      },
      async deleteDimensionSchema(indexToRemove: number) {
        const dimensions = store.dimensionsCopy().slice();

        const newDimensions = dimensions.filter(
          (_: DimensionType, i: number) => i !== indexToRemove,
        );

        patchState(store, {
          dimensionsCopy: newDimensions,
        });
      },
      async setTags(tags: string[]) {
        patchState(store, setPending());
        const resp = await firstValueFrom(
          tagService.setTags(store.person().id, 'people', tags),
        );
        if (resp && resp.errors) {
          patchState(store, setErrors(resp.errors));

          toastService.sendMessage(
            toastService.createCrudMessage('Tags', 'Updating', false),
            ToastLevel.ERROR,
          );
        } else {
          patchState(store, setFulfilled());

          toastService.sendMessage(
            toastService.createCrudMessage('Tags', 'Updated'),
            ToastLevel.SUCCESS,
          );

          // refresh the list
          refreshService.triggerRefresh();
        }
      },
      async loadCohortsPage(limit: number, offset: number, pageIndex: number) {
        patchState(
          store,
          {
            cohortsListOptions: {
              ...initialCohortsListState,
              offset,
              pageIndex,
              limit,
            },
          },
          setPending(),
        );
        const resp = await firstValueFrom(
          personService.getPersonWithCohorts(
            store.person().id,
            store.cohortsListOptions().limit,
            store.cohortsListOptions().offset,
          ),
        );

        if (resp.errors) {
          patchState(store, setErrors(resp.errors));

          toastService.sendMessage(
            toastService.createCrudMessage('Cohorts', 'Fetching', false),
            ToastLevel.ERROR,
          );
        } else {
          patchState(
            store,
            {
              person: resp.data,
              isReady: true,
            },
            setFulfilled(),
          );
        }
      },
      async attachCohort(cohortId: string) {
        patchState(store, setPending());
        const resp = await firstValueFrom(
          personService.attachCohort(store.person().id, cohortId),
        );
        if (resp && resp.errors) {
          patchState(store, setErrors(resp.errors));

          toastService.sendMessage(
            toastService.createCrudMessage('Cohort', 'Updating', false),
            ToastLevel.ERROR,
          );
        } else {
          await this.loadCohortsPage(
            store.cohortsListOptions().limit,
            store.cohortsListOptions().offset,
            store.cohortsListOptions().pageIndex,
          );
          toastService.sendMessage(
            toastService.createCrudMessage('Cohort', 'Updated'),
            ToastLevel.SUCCESS,
          );
        }
      },
      async detachCohort(cohortId: string) {
        patchState(store, setPending());
        const resp = await firstValueFrom(
          personService.detachCohort(store.person().id, cohortId),
        );
        if (resp && resp.errors) {
          patchState(store, setErrors(resp.errors));

          toastService.sendMessage(
            toastService.createCrudMessage('Cohort', 'Removing', false),
            ToastLevel.ERROR,
          );
        } else {
          const isLastCohortOnPage = isRelationLastOnPage(
            store.person().cohortsCount,
            store.cohortsListOptions().limit,
            store.cohortsListOptions().pageIndex,
            store.cohortsListOptions().offset,
          );
          // Go to previous page if last cohort in page other than final one
          const pageIndex = isLastCohortOnPage
            ? store.cohortsListOptions().pageIndex - 1
            : store.cohortsListOptions().pageIndex;
          const offset = isLastCohortOnPage
            ? store.cohortsListOptions().offset -
              store.cohortsListOptions().limit
            : store.cohortsListOptions().offset;

          await this.loadCohortsPage(
            store.cohortsListOptions().limit,
            offset,
            pageIndex,
          );

          toastService.sendMessage(
            toastService.createCrudMessage('Cohort', 'Removed'),
            ToastLevel.SUCCESS,
          );
        }
      },
    }),
  ),
  withComputed(({ person }) => ({
    tagStrings: computed(() => person()?.tags?.map((tag: string) => tag) ?? []),
  })),
);
