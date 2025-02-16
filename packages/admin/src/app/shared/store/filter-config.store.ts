import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import {
  withRequestStatus,
  setPending,
  setFulfilled,
} from '@shared/store/request-status.feature';
import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { FilterConfigModel } from '../models/filter-config.model';
import { FilterConfigService } from '../services/filter-config.service';
import { SubfeatureModel } from '../models/subfeature.model';

interface FilterConfigState {
  filterConfig: FilterConfigModel[];
}

const initialState: FilterConfigState = {
  filterConfig: [],
};

export const FilterConfigStore = signalStore(
  { providedIn: 'root' },
  withDevtools('filterConfig'),
  withState(initialState),
  withRequestStatus(),
  withMethods((store, filterConfigService = inject(FilterConfigService)) => ({
    async load() {
      patchState(store, setPending());
      const resp: FilterConfigModel[] = await firstValueFrom(
        filterConfigService.getFilterConfig(),
      );
      patchState(store, { filterConfig: resp }, setFulfilled());
    },
    getConfigForFeature(feature: string, subFeature: SubfeatureModel | null) {
      let matchingFeature = feature;
      if (subFeature && subFeature.path === 'types') {
        switch (feature) {
          case 'events':
            matchingFeature = 'event_types';
            break;
          case 'facts':
            matchingFeature = 'fact_types';
            break;
          case 'people':
            matchingFeature = 'person_types';
            break;
          case 'resources':
            matchingFeature = 'resource_types';
            break;
        }
      } else if (feature === 'settings') {
        matchingFeature = 'users';
      }
      return store
        .filterConfig()
        .find(config => config.feature === matchingFeature);
    },
  })),
);
