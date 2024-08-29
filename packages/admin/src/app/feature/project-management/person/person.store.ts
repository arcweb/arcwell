import {
  patchState,
  signalStore,
  withHooks,
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
import { inject } from '@angular/core';
import { firstValueFrom, forkJoin } from 'rxjs';
import { PersonType, PersonUpdateType } from '@shared/schemas/person.schema';
import { PersonTypeService } from '@shared/services/person-type.service';
import { PersonTypeType } from '@schemas/person-type.schema';

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
      async update(updatePersonFormData: PersonUpdateType) {
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
        }
      },
      async create(createPersonFormData: PersonType) {
        console.log('createPersonFormData', createPersonFormData);
        patchState(store, setPending());
        createPersonFormData.typeKey = createPersonFormData.personType.key;

        const resp = await firstValueFrom(
          personService.create(createPersonFormData),
        );
        if (resp.errors) {
          patchState(store, setErrors(resp.errors));
        } else {
          // TODO: Do we need to do this if we are navigating away?
          patchState(
            store,
            { person: resp.data, inEditMode: false },
            setFulfilled(),
          );
        }
      },
      async delete() {
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
    }),
  ),
);
