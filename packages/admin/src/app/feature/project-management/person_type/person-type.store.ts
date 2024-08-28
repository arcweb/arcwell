import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
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

interface PersonTypeState {
  personType: PersonType | null;
  inEditMode: boolean;
  inCreateMode: boolean;
  isReady: boolean;
}

const initialState: PersonTypeState = {
  personType: null,
  inEditMode: false,
  inCreateMode: false,
  isReady: false,
};

export const PersonTypeStore = signalStore(
  withDevtools('personType'),
  withState(initialState),
  withRequestStatus(),
  withMethods((store, personTypeService = inject(PersonTypeService)) => ({
    async initialize(personTypeId: string) {
      patchState(store, setPending());
      const resp = await firstValueFrom(
        personTypeService.getPersonType(personTypeId),
      );
      if (resp.errors) {
        patchState(store, { isReady: true }, setErrors(resp.errors));
      } else {
        patchState(
          store,
          {
            personType: resp.data,
            isReady: true,
          },
          setFulfilled(),
        );
      }
    },
    async initializeForCreate() {
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
    async update(updatePersonFormData: PersonUpdateType) {
      patchState(store, setPending());
      updatePersonFormData.id = store.personType().id;
      if (
        updatePersonFormData.personType &&
        updatePersonFormData.personType.id
      ) {
        updatePersonFormData.personTypeId = updatePersonFormData.personType.id;
      }
      const resp = await firstValueFrom(
        personTypeService.update(updatePersonFormData),
      );
      if (resp.errors) {
        patchState(store, setErrors(resp.errors));
      } else {
        patchState(
          store,
          { personType: resp.data, inEditMode: false },
          setFulfilled(),
        );
      }
    },
    async create(createPersonTypeFormData: PersonType) {
      console.log('createPersonFormData', createPersonTypeFormData);
      patchState(store, setPending());
      const resp = await firstValueFrom(
        personTypeService.create(createPersonTypeFormData),
      );
      if (resp.errors) {
        patchState(store, setErrors(resp.errors));
      } else {
        // TODO: Do we need to do this if we are navigating away?
        patchState(
          store,
          { personType: resp.data, inEditMode: false },
          setFulfilled(),
        );
      }
    },
    async delete() {
      patchState(store, setPending());
      const resp = await firstValueFrom(
        personTypeService.delete(store.personType().id),
      );
      if (resp && resp.errors) {
        patchState(store, setErrors(resp.errors));
      } else {
        patchState(store, { inEditMode: false }, setFulfilled());
      }
    },
  })),
);
