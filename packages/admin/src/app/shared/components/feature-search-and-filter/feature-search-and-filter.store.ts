import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { withRequestStatus } from '@shared/store/request-status.feature';
import { inject } from '@angular/core';
import { FeatureStore } from '@app/shared/store/feature.store';
import { FeatureFilter } from '@app/shared/interfaces/feature-filter';

// TODO: Future filter functionality should be defined here in the store
interface FeatureSearchAndFilterState {
  currentFeature: string;
  currentSubFeature: string | null;
  searchText: string;
  filters: FeatureFilter[];
}

const initialState: FeatureSearchAndFilterState = {
  currentFeature: '',
  currentSubFeature: '',
  searchText: '',
  filters: [],
};

export const FeatureSearchAndFilterStore = signalStore(
  { providedIn: 'root' },
  withDevtools('searchandfilters'),
  withState(initialState),
  withRequestStatus(),
  withMethods((store, featureStore = inject(FeatureStore)) => ({
    checkCurrentFeature(
      currentFeature: string,
      currentSubFeature: string | null,
    ) {
      if (store.currentFeature() !== currentFeature) {
        // Reset all search/filter settings on feature change
        this.resetAll();
        patchState(store, { currentFeature, currentSubFeature });
        return;
      }

      if (store.currentSubFeature() !== currentSubFeature) {
        // Reset all if switching to a "type" screen or off
        if (
          (currentSubFeature === 'types' &&
            store.currentSubFeature() !== 'types') ||
          (currentSubFeature !== 'types' &&
            store.currentSubFeature() === 'types')
        ) {
          this.resetAll();
          patchState(store, { currentFeature });
        }
        patchState(store, { currentSubFeature });
      }
    },
    setFeatureValuesOnInit() {
      const currentFeature = featureStore.activeFeature()
        ? featureStore.activeFeature()!.path
        : '';
      const currentSubFeature = featureStore.activeSubfeature()
        ? featureStore.activeSubfeature()!.path
        : null;
      patchState(store, { currentFeature, currentSubFeature });
    },
    setSearchText(searchText: string) {
      patchState(store, { searchText });
    },
    resetAll() {
      patchState(store, { ...initialState });
    },
  })),
);
