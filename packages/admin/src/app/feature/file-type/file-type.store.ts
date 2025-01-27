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
import { FileType } from '@schemas/file.schema';
import { FileTypeService } from '@shared/services/file-type.service';
import { TagService } from '@shared/services/tag.service';
import { FeatureStore } from '@app/shared/store/feature.store';
import { ToastService } from '@app/shared/services/toast.service';
import { ToastLevel } from '@app/shared/models';
import { RefreshService } from '@app/shared/services/refresh.service';
import { DetailStore } from '@feature/detail/detail.store';
import { DimensionSchemaType } from '@schemas/dimension-schema.schema';

interface FileTypeState {
  fileType: FileType | null;
  dimensionSchemasCopy: DimensionSchemaType[] | [];
  inEditMode: boolean;
  inCreateMode: boolean;
  isReady: boolean;
}

const initialState: FileTypeState = {
  fileType: null,
  dimensionSchemasCopy: [],
  inEditMode: false,
  inCreateMode: false,
  isReady: false,
};

export const FileTypeStore = signalStore(
  withDevtools('fileType'),
  withState(initialState),
  withRequestStatus(),
  withMethods(
    (
      store,
      fileTypeService = inject(FileTypeService),
      tagService = inject(TagService),
      featureStore = inject(FeatureStore),
      toastService = inject(ToastService),
      detailStore = inject(DetailStore),
      refreshService = inject(RefreshService),
    ) => ({
      async initialize(fileTypeId: string) {
        patchState(store, setPending());
        const resp = await firstValueFrom(
          fileTypeService.getFileType(fileTypeId),
        );
        if (resp.errors) {
          patchState(store, { isReady: true }, setErrors(resp.errors));

          toastService.sendMessage(
            toastService.createCrudMessage('File Type', 'Fetching', false),
            ToastLevel.ERROR,
          );
        } else {
          const dimensionSchemasCopy =
            resp.data.dimensionSchemas?.slice() ?? [];
          patchState(
            store,
            {
              fileType: resp.data,
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
      async update(updateFileTypeFormData: FileType) {
        updateFileTypeFormData.id = store.fileType().id;
        patchState(store, setPending());
        const resp = await firstValueFrom(
          fileTypeService.update(updateFileTypeFormData),
        );
        if (resp.errors) {
          patchState(store, setErrors(resp.errors));

          toastService.sendMessage(
            toastService.createCrudMessage('File Type', 'Updating', false),
            ToastLevel.ERROR,
          );
        } else {
          patchState(
            store,
            { fileType: resp.data, inEditMode: false },
            setFulfilled(),
          );

          toastService.sendMessage(
            toastService.createCrudMessage('File Type', 'Updated'),
            ToastLevel.SUCCESS,
          );

          // load the feature list with the latest list of subfeatures
          featureStore.load();
          // refresh the list
          refreshService.triggerRefresh();
        }
      },
      async create(createFileTypeFormData: FileType) {
        patchState(store, setPending());
        const resp = await firstValueFrom(
          fileTypeService.create(createFileTypeFormData),
        );
        if (resp.errors) {
          patchState(store, setErrors(resp.errors));
        } else {
          toastService.sendMessage(
            toastService.createCrudMessage('File Type', 'Created'),
            ToastLevel.SUCCESS,
          );
          patchState(
            store,
            { fileType: resp.data, inEditMode: false, inCreateMode: false },
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
          fileTypeService.delete(store.fileType().id),
        );
        if (resp && resp.errors) {
          patchState(store, setErrors(resp.errors));

          toastService.sendMessage(
            toastService.createCrudMessage('File Type', 'Deleting', false),
            ToastLevel.ERROR,
          );
        } else {
          patchState(store, { inEditMode: false }, setFulfilled());

          toastService.sendMessage(
            toastService.createCrudMessage('File Type', 'Deleted'),
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
        const newDimensionSchemas = store.fileType().dimensionSchemas.slice();
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
          tagService.setTags(store.fileType().id, 'file_types', tags),
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
  withComputed(({ fileType }) => ({
    tagStrings: computed(
      () => fileType()?.tags?.map((tag: string) => tag) ?? [],
    ),
  })),
);
