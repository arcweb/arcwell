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
import { firstValueFrom } from 'rxjs';
import { PersonType, PersonUpdateType } from '@shared/schemas/person.schema';

interface PersonState {
  person: PersonType | null;
  inEditMode: boolean;
  isReady: boolean;
}

const initialState: PersonState = {
  person: null,
  inEditMode: false,
  isReady: false,
};

export const PersonStore = signalStore(
  withDevtools('person'),
  withState(initialState),
  withRequestStatus(),
  withMethods((store, personService = inject(PersonService)) => ({
    async initialize(personId: string) {
      patchState(store, setPending());
      const resp = await firstValueFrom(personService.getPerson(personId));
      if (resp.errors) {
        patchState(store, { isReady: true }, setErrors(resp.errors));
      } else {
        patchState(store, { person: resp.data, isReady: true }, setFulfilled());
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
  })),
  withHooks({
    onInit(store) {
      store.loadPersonTypes();
    },
  }),
);
