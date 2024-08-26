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
import { PersonTypesService } from '@shared/services/person-types.service';
import { PersonTypeType } from '@schemas/person-type.schema';

interface PersonState {
  person: PersonType | null;
  personTypes: PersonTypeType[];
  inEditMode: boolean;
  isReady: boolean;
}

const initialState: PersonState = {
  person: null,
  personTypes: [],
  inEditMode: false,
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
      personTypeService = inject(PersonTypesService),
    ) => ({
      async initialize(personId: string) {
        patchState(store, setPending());
        // const resp = await firstValueFrom(personService.getPerson(personId));
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
      async loadPersonTypes() {
        // TODO: Add person types when available
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
          updatePersonFormData.personTypeId =
            updatePersonFormData.personType.id;
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
    }),
  ),
  withHooks({
    onInit(store) {
      store.loadPersonTypes();
    },
  }),
);
