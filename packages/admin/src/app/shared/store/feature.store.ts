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
        this.setActiveFeatureAndSubfeatureByRoute(router.url, resp);

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
      setActiveFeatureAndSubfeatureByRoute(
        url: string,
        features: FeatureModel[],
        fulfillRequest: boolean = false,
      ) {
        const activeFeature = features.find(feature =>
          url.includes(feature.path),
        );
        if (activeFeature) {
          const activeSubfeature = cloneDeep(activeFeature.subfeatures)
            .reverse()
            .find(subfeature => url.includes(subfeature.path));
          patchState(store, {
            activeFeature: activeFeature || null,
            activeSubfeature: activeSubfeature || null,
          });
        }
        if (fulfillRequest) {
          patchState(store, setFulfilled());
        }
      },
    }),
  ),
);
