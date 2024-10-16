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
import { ToastService } from '@app/shared/services/toast.service';
import { ToastLevel } from '@app/shared/models';
import { RefreshService } from '@app/shared/services/refresh.service';
import { DetailStore } from '@feature/project-management/detail/detail.store';

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
      refreshService = inject(RefreshService),
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
          patchState(
            store,
            { resourceType: resp.data, inEditMode: false },
            setFulfilled(),
          );

          toastService.sendMessage(
            'Updated resource type.',
            ToastLevel.SUCCESS,
          );

          // load the feature list with the latest list of subfeatures
          featureStore.load();
          // refresh the list
          refreshService.triggerRefresh();
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
          patchState(
            store,
            { resourceType: resp.data, inEditMode: false, inCreateMode: false },
            setFulfilled(),
          );

          toastService.sendMessage(
            'Created resource type.',
            ToastLevel.SUCCESS,
          );

          // load the feature list with the latest list of subfeatures
          featureStore.load();
          // refresh the list
          refreshService.triggerRefresh();
          // navigate to the newly created item
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
          toastService.sendMessage(
            'Deleted resource type.',
            ToastLevel.SUCCESS,
          );
          patchState(store, { inEditMode: false }, setFulfilled());

          // load the feature list with the latest list of subfeatures
          featureStore.load();
          // refresh the list
          refreshService.triggerRefresh();
          // clear the detail id to close the drawer
          detailStore.clearDetailId();
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

          toastService.sendMessage('Tags updated.', ToastLevel.SUCCESS);

          // refresh the list
          refreshService.triggerRefresh();
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
