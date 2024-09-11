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

interface FeatureState {
  features: FeatureModel[];
  currentFeaturePath: string | null;
  currentSubfeature: SubfeatureType | null;
}

const initialState: FeatureState = {
  features: [],
  currentFeaturePath: null,
  currentSubfeature: null,
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
        // get the current feature and subfeature path from the url or default to the first feature and the 2nd subfeature
        // TODO: refactor this when we have dynamic routing
        const currentFeaturePath =
          resp.find(feature => feature.path === router.url.split('/')[2])
            ?.path || resp[0].path;
        const currentSubfeature =
          resp
            .find(feature => feature.path === router.url.split('/')[2])
            ?.subfeatures.find(
              subfeature => subfeature.path === router.url.split('/')[3],
            ) || resp[0].subfeatures[1];
        patchState(
          store,
          {
            features: resp,
            currentFeaturePath: currentFeaturePath,
            currentSubfeature,
          },
          setFulfilled(),
        );
      },
      setCurrentFeature(featurePath: string) {
        const currentSubfeature = store
          .features()
          .find(feature => feature.path === featurePath)?.subfeatures[1];
        patchState(store, {
          currentFeaturePath: featurePath,
          currentSubfeature: currentSubfeature,
        });
      },
      setCurrentSubfeature(subfeaturePath: string) {
        const currentSubfeature = store
          .features()
          .find(feature => feature.path === store.currentFeaturePath())
          ?.subfeatures.find(subfeature => subfeature.path === subfeaturePath);
        patchState(store, {
          currentSubfeature,
        });
      },
    }),
  ),
  withComputed(({ features, currentFeaturePath }) => ({
    currentFeature: computed(() => {
      return features().find(feature => feature.path === currentFeaturePath());
    }),
  })),
  withHooks({
    onInit(store) {
      store.load();
    },
  }),
);
