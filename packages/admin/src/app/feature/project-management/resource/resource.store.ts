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
import { TagType } from '@schemas/tag.schema';
import { ResourceTypeService } from '@app/shared/services/resource-type.service';
import { Router } from '@angular/router';
import { ToastService } from '@app/shared/services/toast.service';
import { ToastLevel } from '@app/shared/models';
import { DetailStore } from '../detail/detail.store';

interface ResourceState {
  resource: ResourceType | null;
  resourceTypes: ResourceTypeType[];
  inEditMode: boolean;
  inCreateMode: boolean;
  isReady: boolean;
}

const initialState: ResourceState = {
  resource: null,
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
        } else if (resourceTypesResponse.errors) {
          patchState(
            store,
            { isReady: true },
            setErrors(resourceTypesResponse.errors),
          );
        } else {
          patchState(
            store,
            {
              resource: resourceResponse.data,
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
        const resp = await firstValueFrom(
          resourceService.update(updateResourceFormData),
        );
        if (resp.errors) {
          patchState(store, setErrors(resp.errors));
        } else {
          patchState(
            store,
            { resource: resp.data, inEditMode: false },
            setFulfilled(),
          );

          toastService.sendMessage('Resource updated.', ToastLevel.SUCCESS);
        }
      },
      async create(createResourceFormData: ResourceType) {
        patchState(store, setPending());
        createResourceFormData.typeKey =
          createResourceFormData.resourceType.key;

        const resp = await firstValueFrom(
          resourceService.create(createResourceFormData),
        );
        if (resp.errors) {
          patchState(store, setErrors(resp.errors));
        } else {
          patchState(
            store,
            { resource: resp.data, inEditMode: false, inCreateMode: false },
            setFulfilled(),
          );

          toastService.sendMessage('Resource created.', ToastLevel.SUCCESS);

          // navigate to the new resource
          detailStore.routeToNewDetailId(
            resp.data.id,
            resp.data.resourceType.key,
          );
        }
      },
      async delete() {
        patchState(store, setPending());
        const resp = await firstValueFrom(
          resourceService.delete(store.resource().id),
        );
        if (resp && resp.errors) {
          patchState(store, setErrors(resp.errors));
        } else {
          patchState(store, { inEditMode: false }, setFulfilled());
        }
      },
      async setTags(tags: string[]) {
        patchState(store, setPending());
        const resp = await firstValueFrom(
          tagService.setTags(store.resource().id, 'resources', tags),
        );
        if (resp && resp.errors) {
          patchState(store, setErrors(resp.errors));
        } else {
          patchState(store, setFulfilled());
        }
      },
    }),
  ),
  withComputed(({ resource }) => ({
    tagStrings: computed(
      () => resource()?.tags?.map((tag: TagType) => tag.pathname) ?? [],
    ),
  })),
);
