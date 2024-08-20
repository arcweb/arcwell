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
} from '@shared/store/request-status.feature';
import { PersonService } from '@shared/services/person.service';
import { inject } from '@angular/core';
import { PersonModel } from '@shared/models/person.model';
import { lastValueFrom } from 'rxjs';

interface PersonState {
  person: PersonModel | null;
}

const initialState: PersonState = {
  person: null,
};

export const PersonStore = signalStore(
  withDevtools('person'),
  withState(initialState),
  withRequestStatus(),
  withMethods((store, personService = inject(PersonService)) => ({
    async load(personId: string) {
      patchState(store, setPending());
      const resp: PersonModel | null = await lastValueFrom(
        personService.getPerson(personId),
      );
      patchState(store, { person: resp }, setFulfilled());
    },
  })),
);
