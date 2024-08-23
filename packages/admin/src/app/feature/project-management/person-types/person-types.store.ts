import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import {
  withRequestStatus,
  setPending,
  setFulfilled,
} from '@shared/store/request-status.feature';

import { PersonTypesService } from '@app/shared/services/person-types.service';
import { inject } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { PersonTypeModel } from '@app/shared/models/person-type.model';

interface PersonTypesState {
  personTypes: PersonTypeModel[];
  totalData: number;
}

const initialState: PersonTypesState = {
  personTypes: [],
  totalData: 0,
};

export const PersonTypesStore = signalStore(
  withDevtools('personTypes'),
  withState(initialState),
  withRequestStatus(),
  withMethods((store, personTypesService = inject(PersonTypesService)) => ({
    async getPersonTypes() {
      patchState(store, setPending());
      const resp: { data: PersonTypeModel[]; meta: any } = await lastValueFrom(
        personTypesService.getPersonTypes(),
      );
      patchState(store, { personTypes: resp.data }, setFulfilled());
    },
  })),
);
