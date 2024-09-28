import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import {
  setErrors,
  setFulfilled,
  setPending,
  withRequestStatus,
} from '@shared/store/request-status.feature';
import { computed, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { FactType, FactUpdateType } from '@schemas/fact.schema';
import { FactTypeService } from '@shared/services/fact-type.service';
import { TagService } from '@shared/services/tag.service';
import { TagType } from '@schemas/tag.schema';
import { FeatureStore } from '@app/shared/store/feature.store';
import { ToastService } from '@app/shared/services/toast.service';
import { Router } from '@angular/router';
import { ToastLevel } from '@app/shared/models';

interface FactTypeState {
  factType: FactType | null;
  inEditMode: boolean;
  inCreateMode: boolean;
  isReady: boolean;
}

const initialState: FactTypeState = {
  factType: null,
  inEditMode: false,
  inCreateMode: false,
  isReady: false,
};

export const FactTypeStore = signalStore(
  withDevtools('factType'),
  withState(initialState),
  withRequestStatus(),
  withMethods(
    (
      store,
      factTypeService = inject(FactTypeService),
      tagService = inject(TagService),
      featureStore = inject(FeatureStore),
      toastService = inject(ToastService),
      router = inject(Router),
    ) => ({
      async initialize(factTypeId: string) {
        patchState(store, setPending());
        const resp = await firstValueFrom(
          factTypeService.getFactType(factTypeId),
        );
        if (resp.errors) {
          patchState(store, { isReady: true }, setErrors(resp.errors));
        } else {
          patchState(
            store,
            {
              factType: resp.data,
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
      async update(updateFactFormData: FactUpdateType) {
        patchState(store, setPending());
        updateFactFormData.id = store.factType().id;
        if (updateFactFormData.factType && updateFactFormData.factType.id) {
          updateFactFormData.factTypeId = updateFactFormData.factType.id;
        }
        updateFactFormData.dimensions = JSON.parse(
          updateFactFormData.dimensions,
        );
        const resp = await firstValueFrom(
          factTypeService.update(updateFactFormData),
        );
        if (resp.errors) {
          patchState(store, setErrors(resp.errors));
        } else {
          // load the feature list with the latest list of subfeatures
          featureStore.load();

          toastService.sendMessage('Updated Fact Type.', ToastLevel.SUCCESS);

          patchState(
            store,
            { factType: resp.data, inEditMode: false },
            setFulfilled(),
          );
        }
      },
      async create(createFactTypeFormData: FactType) {
        if (createFactTypeFormData.dimensionSchemas) {
          createFactTypeFormData.dimensionSchemas = JSON.parse(
            createFactTypeFormData.dimensionSchemas,
          );
        }

        patchState(store, setPending());
        const resp = await firstValueFrom(
          factTypeService.create(createFactTypeFormData),
        );
        if (resp.errors) {
          patchState(store, setErrors(resp.errors));
        } else {
          // load the feature list with the latest list of subfeatures
          featureStore.load();

          toastService.sendMessage('Created Fact Type.', ToastLevel.SUCCESS);
          patchState(
            store,
            { factType: resp.data, inEditMode: false, inCreateMode: false },
            setFulfilled(),
          );

          // navigate the user to the newly created item and dont save the current route in the history
          router.navigateByUrl(
            `/project-management/facts/types/${resp.data.id}`,
            { replaceUrl: true },
          );
        }
      },
      async delete() {
        patchState(store, setPending());
        const resp = await firstValueFrom(
          factTypeService.delete(store.factType().id),
        );
        if (resp && resp.errors) {
          patchState(store, setErrors(resp.errors));
        } else {
          // load the feature list with the latest list of subfeatures
          featureStore.load();

          patchState(store, { inEditMode: false }, setFulfilled());
        }
      },
      async setTags(tags: string[]) {
        patchState(store, setPending());
        const resp = await firstValueFrom(
          tagService.setTags(store.factType().id, 'fact_types', tags),
        );
        if (resp && resp.errors) {
          patchState(store, setErrors(resp.errors));
        } else {
          patchState(store, setFulfilled());
        }
      },
    }),
  ),
  withComputed(({ factType }) => ({
    tagStrings: computed(
      () => factType()?.tags?.map((tag: TagType) => tag.pathname) ?? [],
    ),
  })),
);
