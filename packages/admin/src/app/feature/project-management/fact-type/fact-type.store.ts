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
import { FactType, FactUpdateType } from '@schemas/fact.schema';
import { FactTypeService } from '@shared/services/fact-type.service';
import { TagService } from '@shared/services/tag.service';
import { TagType } from '@schemas/tag.schema';

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
        const resp = await firstValueFrom(
          factTypeService.update(updateFactFormData),
        );
        if (resp.errors) {
          patchState(store, setErrors(resp.errors));
        } else {
          patchState(
            store,
            { factType: resp.data, inEditMode: false },
            setFulfilled(),
          );
        }
      },
      async create(createFactTypeFormData: FactType) {
        console.log('createFactFormData', createFactTypeFormData);
        patchState(store, setPending());
        const resp = await firstValueFrom(
          factTypeService.create(createFactTypeFormData),
        );
        if (resp.errors) {
          patchState(store, setErrors(resp.errors));
        } else {
          // TODO: Do we need to do this if we are navigating away?
          patchState(
            store,
            { factType: resp.data, inEditMode: false },
            setFulfilled(),
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
