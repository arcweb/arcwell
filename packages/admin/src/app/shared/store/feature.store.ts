import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import {
  withRequestStatus,
  setPending,
  setFulfilled,
} from '@shared/store/request-status.feature';
import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { FeatureModel } from '@shared/models/feature.model';
import { FeatureService } from '@shared/services/feature.service';
import { Router } from '@angular/router';
import { SubfeatureModel } from '../models/subfeature.model';
import { cloneDeep } from 'lodash-es';
import { ConfigStore } from './config.store';

interface FeatureState {
  features: FeatureModel[];
  activeFeature: FeatureModel | null;
  activeSubfeature: SubfeatureModel | null;
  hasSubfeatures: boolean;
}

const initialState: FeatureState = {
  features: [],
  activeFeature: null,
  activeSubfeature: null,
  hasSubfeatures: true,
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
      configStore = inject(ConfigStore),
    ) => ({
      async load() {
        patchState(store, setPending());
        const resp: FeatureModel[] = await firstValueFrom(
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
      setHasSubfeatures(val: boolean) {
        patchState(store, {
          hasSubfeatures: val,
        });
      },
      setActiveFeatureAndSubfeatureByRoute(
        url: string,
        features: FeatureModel[],
        fulfillRequest = false,
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
            hasSubfeatures: activeFeature.subfeatures.length > 0,
          });

          // set the title of the page
          let title = '';
          if (activeSubfeature?.name) {
            title = activeSubfeature.name;
          } else if (activeFeature?.name) {
            title = activeFeature.name;
          }
          configStore.setTitle(title);
        }
        if (fulfillRequest) {
          patchState(store, setFulfilled());
        }
      },
    }),
  ),
);
