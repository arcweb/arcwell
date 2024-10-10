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
import { TagType } from '@schemas/tag.schema';
import { TagService } from '@shared/services/tag.service';
import { ToastService } from '@shared/services/toast.service';
import { ToastLevel } from '@shared/models';
import { Router } from '@angular/router';
import { isRelationLastOnPage } from '@app/shared/helpers/store.helper';

interface PersonCohortsListState {
  limit: number;
  offset: number;
  pageIndex: number;
}

interface PersonState {
  person: PersonType | null;
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
      router = inject(Router),
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
              person: personResp.data,
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
        const resp = await firstValueFrom(
          personService.update(updatePersonFormData),
        );
        if (resp.errors) {
          patchState(store, setErrors(resp.errors));
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
          toastService.sendMessage('Updated person.', ToastLevel.SUCCESS);
        }
      },
      async createPerson(createPersonFormData: PersonType) {
        patchState(store, setPending());
        createPersonFormData.typeKey = createPersonFormData.personType.key;

        const resp = await firstValueFrom(
          personService.create(createPersonFormData),
        );
        if (resp.errors) {
          patchState(store, setErrors(resp.errors));
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
          toastService.sendMessage('Created person.', ToastLevel.SUCCESS);
          // navigate the user to the newly created item
          router.navigateByUrl(`/people/${resp.data.id}`, {
            replaceUrl: true,
          });
        }
      },
      async deletePerson() {
        patchState(store, setPending());
        const resp = await firstValueFrom(
          personService.delete(store.person().id),
        );
        if (resp && resp.errors) {
          patchState(store, setErrors(resp.errors));
        } else {
          patchState(
            store,
            { inEditMode: false, cohortsListOptions: initialCohortsListState },
            setFulfilled(),
          );
        }
      },
      async setTags(tags: string[]) {
        patchState(store, setPending());
        const resp = await firstValueFrom(
          tagService.setTags(store.person().id, 'people', tags),
        );
        if (resp && resp.errors) {
          patchState(store, setErrors(resp.errors));
        } else {
          patchState(store, setFulfilled());
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
        } else {
          this.loadCohortsPage(
            store.cohortsListOptions().limit,
            store.cohortsListOptions().offset,
            store.cohortsListOptions().pageIndex,
          );
          toastService.sendMessage(
            'Cohort added to person',
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

          this.loadCohortsPage(
            store.cohortsListOptions().limit,
            offset,
            pageIndex,
          );
          toastService.sendMessage(
            'Cohort removed from person',
            ToastLevel.SUCCESS,
          );
        }
      },
    }),
  ),
  withComputed(({ person }) => ({
    tagStrings: computed(
      () => person()?.tags?.map((tag: TagType) => tag.pathname) ?? [],
    ),
  })),
);
