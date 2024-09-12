import {
  patchState,
  signalStore,
  withComputed,
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
import { computed, inject } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { FeatureModel } from '@shared/models/feature.model';
import { FeatureService } from '@shared/services/feature.service';
import { Router } from '@angular/router';
import { SubfeatureType } from '../schemas/subfeature.schema';
import { FeatureType } from '../schemas/feature.schema';
import { SubfeatureModel } from '../models/subfeature.model';
import { cloneDeep } from 'lodash';

interface FeatureState {
  features: FeatureModel[];
  activeFeature: FeatureModel | null;
  activeSubfeature: SubfeatureModel | null;
}

const initialState: FeatureState = {
  features: [],
  activeFeature: null,
  activeSubfeature: null,
};

export const FeatureStore = signalStore(
  { providedIn: 'root' },
  withDevtools('features'),
  withState(initialState),
  withRequestStatus(),
  withMethods(
    (
      store,
      featureService = inject(FeatureService),
      router = inject(Router),
    ) => ({
      async load() {
        patchState(store, setPending());
        const resp: FeatureModel[] = await lastValueFrom(
          featureService.getFeatures(),
        );
        // TODO: Find a way to set feature and subfeature which doesnt
        // repeat the logic from the feature-menu.component.ts
        const activeFeature = resp.find(feature =>
          router.url.includes(feature.path),
        );
        if (activeFeature) {
          patchState(store, { activeFeature });
          const activeSubfeature = cloneDeep(activeFeature.subfeatures)
            .reverse()
            .find(subfeature => router.url.includes(subfeature.path));
          if (activeSubfeature) {
            patchState(store, { activeSubfeature });
          }
        }

        patchState(
          store,
          {
            features: resp,
          },
          setFulfilled(),
        );
      },
      setActiveFeature(feature: FeatureModel) {
        patchState(store, {
          activeFeature: feature,
        });
      },
      setActiveSubfeature(subfeature: SubfeatureModel) {
        patchState(store, {
          activeSubfeature: subfeature,
        });
      },
    }),
  ),
);
