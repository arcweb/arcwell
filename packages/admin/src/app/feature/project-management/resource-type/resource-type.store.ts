import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import {
  withRequestStatus,
  setPending,
  setFulfilled,
  setErrors,
} from '@shared/store/request-status.feature';
import { computed, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ResourceTypeService } from '@shared/services/resource-type.service';
import { TagService } from '@shared/services/tag.service';
import { ResourceTypeType } from '@app/shared/schemas/resource-type.schema';
import {
  ResourceType,
  ResourceUpdateType,
} from '@app/shared/schemas/resource.schema';
import { FeatureStore } from '@app/shared/store/feature.store';
import { Router } from '@angular/router';
import { ToastService } from '@app/shared/services/toast.service';
import { ToastLevel } from '@app/shared/models';
import { DetailStore } from '../detail/detail.store';

interface ResourceTypeState {
  resourceType: ResourceType | null;
  inEditMode: boolean;
  inCreateMode: boolean;
  isReady: boolean;
}

const initialState: ResourceTypeState = {
  resourceType: null,
  inEditMode: false,
  inCreateMode: false,
  isReady: false,
};

export const ResourceTypeStore = signalStore(
  withDevtools('resourceType'),
  withState(initialState),
  withRequestStatus(),
  withMethods(
    (
      store,
      resourceTypeService = inject(ResourceTypeService),
      tagService = inject(TagService),
      featureStore = inject(FeatureStore),
      toastService = inject(ToastService),
      detailStore = inject(DetailStore),
    ) => ({
      async initialize(resourceTypeId: string) {
        patchState(store, setPending());
        const resp = await firstValueFrom(
          resourceTypeService.getResourceType(resourceTypeId),
        );
        if (resp.errors) {
          patchState(store, { isReady: true }, setErrors(resp.errors));
        } else {
          patchState(
            store,
            {
              resourceType: resp.data,
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
      async update(updateResourceFormData: ResourceUpdateType) {
        patchState(store, setPending());
        updateResourceFormData.id = store.resourceType().id;
        if (
          updateResourceFormData.resourceType &&
          updateResourceFormData.resourceType.id
        ) {
          updateResourceFormData.resourceTypeId =
            updateResourceFormData.resourceType.id;
        }
        const resp = await firstValueFrom(
          resourceTypeService.update(updateResourceFormData),
        );
        if (resp.errors) {
          patchState(store, setErrors(resp.errors));
        } else {
          // load the feature list with the latest list of subfeatures
          featureStore.load();

          toastService.sendMessage(
            'Updated resource type.',
            ToastLevel.SUCCESS,
          );

          patchState(
            store,
            { resourceType: resp.data, inEditMode: false },
            setFulfilled(),
          );
        }
      },
      async create(createResourceTypeFormData: ResourceTypeType) {
        patchState(store, setPending());
        const resp = await firstValueFrom(
          resourceTypeService.create(createResourceTypeFormData),
        );
        if (resp.errors) {
          patchState(store, setErrors(resp.errors));
        } else {
          // load the feature list with the latest list of subfeatures
          featureStore.load();

          patchState(
            store,
            { resourceType: resp.data, inEditMode: false, inCreateMode: false },
            setFulfilled(),
          );

          toastService.sendMessage(
            'Created resource type.',
            ToastLevel.SUCCESS,
          );

          // navigate to the newly created item and don't save the current route in the history
          detailStore.routeToNewDetailId(resp.data.id);
        }
      },
      async delete() {
        patchState(store, setPending());
        const resp = await firstValueFrom(
          resourceTypeService.delete(store.resourceType().id),
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
          tagService.setTags(store.resourceType().id, 'resource_types', tags),
        );
        if (resp && resp.errors) {
          patchState(store, setErrors(resp.errors));
        } else {
          patchState(store, setFulfilled());
        }
      },
    }),
  ),
  withComputed(({ resourceType }) => ({
    tagStrings: computed(
      () => resourceType()?.tags?.map((tag: string) => tag) ?? [],
    ),
  })),
);
