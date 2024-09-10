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
import { FactService } from '@shared/services/fact.service';
import { computed, inject } from '@angular/core';
import { firstValueFrom, forkJoin } from 'rxjs';
import { FactType, FactUpdateType } from '@shared/schemas/fact.schema';
import { FactTypeService } from '@shared/services/fact-type.service';
import { FactTypeType } from '@schemas/fact-type.schema';
import { TagType } from '@schemas/tag.schema';
import { TagService } from '@shared/services/tag.service';
import { ToastService } from '@shared/services/toast.service';
import { ToastLevel } from '@shared/models';

interface FactState {
  fact: FactType | null;
  factTypes: FactTypeType[];
  inEditMode: boolean;
  inCreateMode: boolean;
  isReady: boolean;
}

const initialState: FactState = {
  fact: null,
  factTypes: [],
  inEditMode: false,
  inCreateMode: false,
  isReady: false,
};

export const FactStore = signalStore(
  withDevtools('fact'),
  withState(initialState),
  withRequestStatus(),
  withMethods(
    (
      store,
      factService = inject(FactService),
      factTypeService = inject(FactTypeService),
      tagService = inject(TagService),
      toastService = inject(ToastService),
    ) => ({
      async initialize(factId: string) {
        patchState(store, setPending());
        const { factResp, factTypesResp } = await firstValueFrom(
          forkJoin({
            factResp: factService.getFact(factId),
            factTypesResp: factTypeService.getFactTypes(),
          }),
        );
        if (factResp.errors) {
          patchState(store, { isReady: true }, setErrors(factResp.errors));
        } else if (factTypesResp.errors) {
          patchState(store, { isReady: true }, setErrors(factTypesResp.errors));
        } else {
          patchState(
            store,
            {
              fact: factResp.data,
              factTypes: factTypesResp.data,
              isReady: true,
            },
            setFulfilled(),
          );
        }
      },
      async initializeForCreate() {
        patchState(store, setPending());
        const factTypesResp = await firstValueFrom(
          factTypeService.getFactTypes(),
        );
        if (factTypesResp.errors) {
          patchState(store, { isReady: true }, setErrors(factTypesResp.errors));
        } else {
          patchState(
            store,
            {
              factTypes: factTypesResp.data,
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
      async updateFact(updateFactFormData: FactUpdateType) {
        patchState(store, setPending());
        updateFactFormData.id = store.fact().id;
        if (updateFactFormData.factType && updateFactFormData.factType.id) {
          updateFactFormData.typeKey = updateFactFormData.factType.key;
        }
        const resp = await firstValueFrom(
          factService.update(updateFactFormData),
        );
        if (resp.errors) {
          patchState(store, setErrors(resp.errors));
          toastService.sendMessage('Error uploading facts.', ToastLevel.ERROR);
        } else {
          patchState(
            store,
            { fact: resp.data, inEditMode: false },
            setFulfilled(),
          );
          toastService.sendMessage('Updated fact.', ToastLevel.SUCCESS);
        }
      },
      async createFact(createFactFormData: FactType) {
        patchState(store, setPending());
        createFactFormData.typeKey = createFactFormData.factType.key;

        const resp = await firstValueFrom(
          factService.create(createFactFormData),
        );
        if (resp.errors) {
          patchState(store, setErrors(resp.errors));
          toastService.sendMessage('Error creating facts.', ToastLevel.ERROR);
        } else {
          // TODO: Do we need to do this if we are navigating away?
          patchState(
            store,
            { fact: resp.data, inEditMode: false },
            setFulfilled(),
          );
          toastService.sendMessage('Created fact.', ToastLevel.SUCCESS);
        }
      },
      async deleteFact() {
        patchState(store, setPending());
        const resp = await firstValueFrom(factService.delete(store.fact().id));
        if (resp && resp.errors) {
          patchState(store, setErrors(resp.errors));
          toastService.sendMessage('Error deleting fact.', ToastLevel.ERROR);
        } else {
          patchState(store, { inEditMode: false }, setFulfilled());
          toastService.sendMessage('Deleted fact.', ToastLevel.SUCCESS);
        }
      },
      async setTags(tags: string[]) {
        patchState(store, setPending());
        const resp = await firstValueFrom(
          tagService.setTags(store.fact().id, 'facts', tags),
        );
        if (resp && resp.errors) {
          patchState(store, setErrors(resp.errors));
          toastService.sendMessage('Error setting facts.', ToastLevel.ERROR);
        } else {
          patchState(store, setFulfilled());
          toastService.sendMessage('Set facts.', ToastLevel.SUCCESS);
        }
      },
    }),
  ),
  withComputed(({ fact }) => ({
    tagStrings: computed(
      () => fact()?.tags?.map((tag: TagType) => tag.pathname) ?? [],
    ),
  })),
);
