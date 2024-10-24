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
import { FactType } from '@schemas/fact.schema';
import { FactTypeService } from '@shared/services/fact-type.service';
import { TagService } from '@shared/services/tag.service';
import { FeatureStore } from '@app/shared/store/feature.store';
import { ToastService } from '@app/shared/services/toast.service';
import { ToastLevel } from '@app/shared/models';
import { RefreshService } from '@app/shared/services/refresh.service';
import { DetailStore } from '@feature/detail/detail.store';
import { DimensionSchemaType } from '@schemas/dimension-schema.schema';

interface FactTypeState {
  factType: FactType | null;
  dimensionSchemasCopy: DimensionSchemaType[] | [];
  inEditMode: boolean;
  inCreateMode: boolean;
  isReady: boolean;
}

const initialState: FactTypeState = {
  factType: null,
  dimensionSchemasCopy: [],
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
      detailStore = inject(DetailStore),
      refreshService = inject(RefreshService),
    ) => ({
      async initialize(factTypeId: string) {
        patchState(store, setPending());
        const resp = await firstValueFrom(
          factTypeService.getFactType(factTypeId),
        );
        if (resp.errors) {
          patchState(store, { isReady: true }, setErrors(resp.errors));

          toastService.sendMessage(
            toastService.createCrudMessage('Fact Type', 'Fetching', false),
            ToastLevel.ERROR,
          );
        } else {
          const dimensionSchemasCopy =
            resp.data.dimensionSchemas?.slice() ?? [];
          patchState(
            store,
            {
              factType: resp.data,
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
      async update(updateFactTypeFormData: FactType) {
        updateFactTypeFormData.id = store.factType().id;
        patchState(store, setPending());
        const resp = await firstValueFrom(
          factTypeService.update(updateFactTypeFormData),
        );
        if (resp.errors) {
          patchState(store, setErrors(resp.errors));

          toastService.sendMessage(
            toastService.createCrudMessage('Fact Type', 'Updating', false),
            ToastLevel.ERROR,
          );
        } else {
          patchState(
            store,
            { factType: resp.data, inEditMode: false },
            setFulfilled(),
          );

          toastService.sendMessage(
            toastService.createCrudMessage('Fact Type', 'Updated'),
            ToastLevel.SUCCESS,
          );

          // load the feature list with the latest list of subfeatures
          featureStore.load();
          // refresh the list
          refreshService.triggerRefresh();
        }
      },
      async create(createFactTypeFormData: FactType) {
        patchState(store, setPending());
        const resp = await firstValueFrom(
          factTypeService.create(createFactTypeFormData),
        );
        if (resp.errors) {
          patchState(store, setErrors(resp.errors));
        } else {
          toastService.sendMessage(
            toastService.createCrudMessage('Fact Type', 'Created'),
            ToastLevel.SUCCESS,
          );
          patchState(
            store,
            { factType: resp.data, inEditMode: false, inCreateMode: false },
            setFulfilled(),
          );

          // load the feature list with the latest list of subfeatures
          featureStore.load();
          // navigate the user to the newly created item
          detailStore.routeToNewDetailId(resp.data.id);
          // refresh the list
          refreshService.triggerRefresh();
        }
      },
      async delete() {
        patchState(store, setPending());
        const resp = await firstValueFrom(
          factTypeService.delete(store.factType().id),
        );
        if (resp && resp.errors) {
          patchState(store, setErrors(resp.errors));

          toastService.sendMessage(
            toastService.createCrudMessage('Fact Type', 'Deleting', false),
            ToastLevel.ERROR,
          );
        } else {
          patchState(store, { inEditMode: false }, setFulfilled());

          toastService.sendMessage(
            toastService.createCrudMessage('Fact Type', 'Deleted'),
            ToastLevel.SUCCESS,
          );

          // load the feature list with the latest list of subfeatures
          featureStore.load();
          // refresh the list
          refreshService.triggerRefresh();
          // clear the detail_id to close the drawer
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
        const newDimensionSchemas = store.factType().dimensionSchemas.slice();
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
          tagService.setTags(store.factType().id, 'fact_types', tags),
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
  withComputed(({ factType }) => ({
    tagStrings: computed(
      () => factType()?.tags?.map((tag: string) => tag) ?? [],
    ),
  })),
);
