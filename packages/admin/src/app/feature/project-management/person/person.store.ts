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

interface PersonState {
  person: PersonType | null;
  personTypes: PersonTypeType[];
  inEditMode: boolean;
  inCreateMode: boolean;
  isReady: boolean;
}

const initialState: PersonState = {
  person: null,
  personTypes: [],
  inEditMode: false,
  inCreateMode: false,
  isReady: false,
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
            personResp: personService.getPerson(personId),
            personTypesResp: personTypeService.getPersonTypes(),
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
            },
            setFulfilled(),
          );
        }
      },
      async initializeForCreate() {
        patchState(store, setPending());
        const personTypesResp = await firstValueFrom(
          personTypeService.getPersonTypes(),
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
            { person: resp.data, inEditMode: false },
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
            { person: resp.data, inEditMode: false, inCreateMode: false },
            setFulfilled(),
          );
          toastService.sendMessage('Created person.', ToastLevel.SUCCESS);
          // navigate the user to the newly created item
          router.navigateByUrl(`/project-management/people/${resp.data.id}`, {
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
          patchState(store, { inEditMode: false }, setFulfilled());
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
    }),
  ),
  withComputed(({ person }) => ({
    tagStrings: computed(
      () => person()?.tags?.map((tag: TagType) => tag.pathname) ?? [],
    ),
  })),
);
