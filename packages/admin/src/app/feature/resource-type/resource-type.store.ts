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
import { DetailStore } from '@feature/detail/detail.store';
import { DimensionSchemaType } from '@schemas/dimension-schema.schema';

interface ResourceTypeState {
  resourceType: ResourceType | null;
  dimensionSchemasCopy: DimensionSchemaType[] | [];
  inEditMode: boolean;
  inCreateMode: boolean;
  isReady: boolean;
}

const initialState: ResourceTypeState = {
  resourceType: null,
  dimensionSchemasCopy: [],
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

          toastService.sendMessage(
            toastService.createCrudMessage('Resource Type', 'Fetching', false),
            ToastLevel.ERROR,
          );
        } else {
          const dimensionSchemasCopy =
            resp.data.dimensionSchemas?.slice() ?? [];
          patchState(
            store,
            {
              resourceType: resp.data,
              dimensionSchemasCopy: dimensionSchemasCopy,
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

          toastService.sendMessage(
            toastService.createCrudMessage('Resource Type', 'Updating', false),
            ToastLevel.ERROR,
          );
        } else {
          patchState(
            store,
            { resourceType: resp.data, inEditMode: false },
            setFulfilled(),
          );

          toastService.sendMessage(
            toastService.createCrudMessage('Resource Type', 'Updated'),
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

          toastService.sendMessage(
            toastService.createCrudMessage('Resource Type', 'Creating', false),
            ToastLevel.ERROR,
          );
        } else {
          patchState(
            store,
            { resourceType: resp.data, inEditMode: false, inCreateMode: false },
            setFulfilled(),
          );

          toastService.sendMessage(
            toastService.createCrudMessage('Resource Type', 'Created'),
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

          toastService.sendMessage(
            toastService.createCrudMessage('Resource Type', 'Deleting', false),
            ToastLevel.ERROR,
          );
        } else {
          patchState(store, { inEditMode: false }, setFulfilled());

          toastService.sendMessage(
            toastService.createCrudMessage('Resource Type', 'Deleted'),
            ToastLevel.SUCCESS,
          );

          // load the feature list with the latest list of subfeatures
          featureStore.load();
          // refresh the list
          refreshService.triggerRefresh();
          // clear the detail id to close the drawer
          detailStore.clearDetailId();
        }
      },
      async setDimensionSchemas(
        index: number,
        dimensionSchema: DimensionSchemaType,
      ) {
        const newDimensionSchemas = store.dimensionSchemasCopy().slice();

        if (index === -1) {
          newDimensionSchemas.push(dimensionSchema);
        } else {
          newDimensionSchemas[index] = dimensionSchema;
        }
        patchState(store, {
          dimensionSchemasCopy: newDimensionSchemas,
        });
      },
      async resetDimensionSchemas() {
        const newDimensionSchemas = store
          .resourceType()
          .dimensionSchemas.slice();
        patchState(store, {
          dimensionSchemasCopy: newDimensionSchemas,
        });
      },
      async deleteDimensionSchema(indexToRemove: number) {
        const dimensionSchemas = store.dimensionSchemasCopy().slice();

        const newDimensionSchemas = dimensionSchemas.filter(
          (_: DimensionSchemaType, i: number) => i !== indexToRemove,
        );

        patchState(store, {
          dimensionSchemasCopy: newDimensionSchemas,
        });
      },
      async setTags(tags: string[]) {
        patchState(store, setPending());
        const resp = await firstValueFrom(
          tagService.setTags(store.resourceType().id, 'resource_types', tags),
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
  withComputed(({ resourceType }) => ({
    tagStrings: computed(
      () => resourceType()?.tags?.map((tag: string) => tag) ?? [],
    ),
  })),
);
