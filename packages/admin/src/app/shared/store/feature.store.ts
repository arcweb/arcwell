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

interface FeatureState {
  features: FeatureModel[];
  currentFeaturePath: string | null;
  currentSubFeaturePath: string | null;
}

const initialState: FeatureState = {
  features: [],
  currentFeaturePath: null,
  currentSubFeaturePath: null,
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
        const currentSubFeaturePath =
          resp
            .find(feature => feature.path === router.url.split('/')[2])
            ?.subFeatures.find(
              subFeature => subFeature.path === router.url.split('/')[3],
            )?.path || resp[0].subFeatures[1].path;
        patchState(
          store,
          {
            features: resp,
            currentFeaturePath: currentFeaturePath,
            currentSubFeaturePath: currentSubFeaturePath,
          },
          setFulfilled(),
        );
      },
      setCurrentFeature(featurePath: string) {
        patchState(store, {
          currentFeaturePath: featurePath,
          currentSubFeaturePath: store
            .features()
            .find(feature => feature.path === featurePath)?.subFeatures[1].path,
        });
      },
      setCurrentSubFeature(subFeaturePath: string) {
        patchState(store, { currentSubFeaturePath: subFeaturePath });
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
