import {
  ResourceType,
  ResourceUpdateType,
} from '@app/shared/schemas/resource.schema';
import { ResourceTypeType } from '@app/shared/schemas/resource-type.schema';
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
} from '@app/shared/store/request-status.feature';
import { computed, inject } from '@angular/core';
import { ResourceService } from '@app/shared/services/resource.service';
import { firstValueFrom, forkJoin } from 'rxjs';
import { TagService } from '@shared/services/tag.service';
import { ResourceTypeService } from '@app/shared/services/resource-type.service';
import { ToastService } from '@app/shared/services/toast.service';
import { ToastLevel } from '@app/shared/models';
import { RefreshService } from '@app/shared/services/refresh.service';
import { DetailStore } from '@feature/detail/detail.store';
import { DimensionType } from '@schemas/dimension.schema';
import { convertDimensionDataTypeValues } from '@shared/helpers/dimension.helper';

interface ResourceState {
  resource: ResourceType | null;
  dimensionsCopy: DimensionType[] | [];
  resourceTypes: ResourceTypeType[];
  inEditMode: boolean;
  inCreateMode: boolean;
  isReady: boolean;
}

const initialState: ResourceState = {
  resource: null,
  dimensionsCopy: [],
  resourceTypes: [],
  inEditMode: false,
  inCreateMode: false,
  isReady: false,
};

export const ResourceStore = signalStore(
  withDevtools('resource'),
  withState(initialState),
  withRequestStatus(),
  withMethods(
    (
      store,
      resourceService = inject(ResourceService),
      resourceTypeService = inject(ResourceTypeService),
      tagService = inject(TagService),
      detailStore = inject(DetailStore),
      toastService = inject(ToastService),
      refreshService = inject(RefreshService),
    ) => ({
      async initialize(resourceId: string) {
        patchState(store, setPending());
        const { resourceResponse, resourceTypesResponse } =
          await firstValueFrom(
            forkJoin({
              resourceResponse: resourceService.getResource(resourceId),
              resourceTypesResponse: resourceTypeService.getResourceTypes({}),
            }),
          );
        if (resourceResponse.errors) {
          patchState(
            store,
            { isReady: true },
            setErrors(resourceResponse.errors),
          );

          toastService.sendMessage(
            toastService.createCrudMessage('Resource', 'Fetching', false),
            ToastLevel.ERROR,
          );
        } else if (resourceTypesResponse.errors) {
          patchState(
            store,
            { isReady: true },
            setErrors(resourceTypesResponse.errors),
          );

          toastService.sendMessage(
            toastService.createCrudMessage('Resource Types', 'Fetching', false),
            ToastLevel.ERROR,
          );
        } else {
          const dimensionsCopy =
            resourceResponse.data.dimensions?.slice() ?? [];
          patchState(
            store,
            {
              resource: resourceResponse.data,
              dimensionsCopy: dimensionsCopy,
              resourceTypes: resourceTypesResponse.data,
              isReady: true,
            },
            setFulfilled(),
          );
        }
      },
      async initializeForCreate() {
        patchState(store, setPending());
        const resourceTypesResp = await firstValueFrom(
          resourceTypeService.getResourceTypes({}),
        );
        if (resourceTypesResp.errors) {
          patchState(
            store,
            { isReady: true },
            setErrors(resourceTypesResp.errors),
          );

          toastService.sendMessage(
            toastService.createCrudMessage('Resource Types', 'Fetching', false),
            ToastLevel.ERROR,
          );
        } else {
          patchState(
            store,
            {
              resourceTypes: resourceTypesResp.data,
              inCreateMode: true,
              inEditMode: true,
              isReady: true,
            },
            setFulfilled(),
          );
        }
      },
      async toggleEditMode() {
        patchState(store, { inEditMode: !store.inEditMode() });
      },
      async update(updateResourceFormData: ResourceUpdateType) {
        patchState(store, setPending());
        updateResourceFormData.id = store.resource().id;
        if (
          updateResourceFormData.resourceType &&
          updateResourceFormData.resourceType.id
        ) {
          updateResourceFormData.typeKey =
            updateResourceFormData.resourceType.key;
        }

        const newResource = convertDimensionDataTypeValues(
          updateResourceFormData,
          'resourceType',
        );

        const resp = await firstValueFrom(resourceService.update(newResource));
        if (resp.errors) {
          patchState(store, setErrors(resp.errors));

          toastService.sendMessage(
            toastService.createCrudMessage('Resource', 'Updating', false),
            ToastLevel.ERROR,
          );
        } else {
          patchState(
            store,
            { resource: resp.data, inEditMode: false },
            setFulfilled(),
          );

          toastService.sendMessage(
            toastService.createCrudMessage('Resource', 'Updated'),
            ToastLevel.SUCCESS,
          );

          // refresh the list
          refreshService.triggerRefresh();
        }
      },
      async create(createResourceFormData: ResourceType) {
        patchState(store, setPending());
        createResourceFormData.typeKey =
          createResourceFormData.resourceType.key;

        const newResource = convertDimensionDataTypeValues(
          createResourceFormData,
          'resourceType',
        );

        const resp = await firstValueFrom(resourceService.create(newResource));
        if (resp.errors) {
          patchState(store, setErrors(resp.errors));

          toastService.sendMessage(
            toastService.createCrudMessage('Resource', 'Creating', false),
            ToastLevel.ERROR,
          );
        } else {
          patchState(
            store,
            { resource: resp.data, inEditMode: false, inCreateMode: false },
            setFulfilled(),
          );

          toastService.sendMessage(
            toastService.createCrudMessage('Resource', 'Created'),
            ToastLevel.SUCCESS,
          );

          // refresh the list
          refreshService.triggerRefresh();
          // navigate to the new resource
          detailStore.routeToNewDetailId(resp.data.id);
        }
      },
      async delete() {
        patchState(store, setPending());
        const resp = await firstValueFrom(
          resourceService.delete(store.resource().id),
        );
        if (resp && resp.errors) {
          patchState(store, setErrors(resp.errors));

          toastService.sendMessage(
            toastService.createCrudMessage('Resource', 'Deleting', false),
            ToastLevel.ERROR,
          );
        } else {
          patchState(store, { inEditMode: false }, setFulfilled());

          toastService.sendMessage(
            toastService.createCrudMessage('Resource', 'Deleted'),
            ToastLevel.SUCCESS,
          );

          // refresh the list
          refreshService.triggerRefresh();
          // clear the detail_id to close the drawer
          detailStore.clearDetailId();
        }
      },
      async setDimensions(index: number, dimension: DimensionType) {
        const newDimensions = store.dimensionsCopy().slice();

        if (index === -1) {
          newDimensions.push(dimension);
        } else {
          newDimensions[index] = dimension;
        }
        patchState(store, {
          dimensionsCopy: newDimensions,
        });
      },
      async resetDimensions() {
        const newDimensions = store.resource().dimensions.slice();
        patchState(store, {
          dimensionsCopy: newDimensions,
        });
      },
      async deleteDimensionSchema(indexToRemove: number) {
        const dimensions = store.dimensionsCopy().slice();

        const newDimensions = dimensions.filter(
          (_: DimensionType, i: number) => i !== indexToRemove,
        );

        patchState(store, {
          dimensionsCopy: newDimensions,
        });
      },
      async setTags(tags: string[]) {
        patchState(store, setPending());
        const resp = await firstValueFrom(
          tagService.setTags(store.resource().id, 'resources', tags),
        );
        if (resp && resp.errors) {
          patchState(store, setErrors(resp.errors));

          toastService.sendMessage(
            toastService.createCrudMessage('Tags', 'Updating', false),
            ToastLevel.ERROR,
          );
        } else {
          patchState(store, setFulfilled());

          toastService.sendMessage(
            toastService.createCrudMessage('Tags', 'Updated'),
            ToastLevel.SUCCESS,
          );

          // refresh the list
          refreshService.triggerRefresh();
        }
      },
    }),
  ),
  withComputed(({ resource }) => ({
    tagStrings: computed(
      () => resource()?.tags?.map((tag: string) => tag) ?? [],
    ),
  })),
);
