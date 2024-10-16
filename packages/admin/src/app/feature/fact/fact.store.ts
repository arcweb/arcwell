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
import { FactService } from '@shared/services/fact.service';
import { computed, inject } from '@angular/core';
import { firstValueFrom, forkJoin } from 'rxjs';
import { FactType, FactUpdateType } from '@shared/schemas/fact.schema';
import { FactTypeService } from '@shared/services/fact-type.service';
import { FactTypeType } from '@schemas/fact-type.schema';
import { TagService } from '@shared/services/tag.service';
import { ToastService } from '@shared/services/toast.service';
import { ToastLevel } from '@shared/models';
import { PersonTypeType } from '@app/shared/schemas/person-type.schema';
import { ResourceTypeType } from '@app/shared/schemas/resource-type.schema';
import { PersonTypeService } from '@app/shared/services/person-type.service';
import { ResourceTypeService } from '@app/shared/services/resource-type.service';
import { RefreshService } from '@app/shared/services/refresh.service';
import { DetailStore } from '@feature/detail/detail.store';

interface FactState {
  fact: FactType | null;
  factTypes: FactTypeType[];
  inEditMode: boolean;
  inCreateMode: boolean;
  isReady: boolean;
  personTypes: PersonTypeType[];
  resourceTypes: ResourceTypeType[];
}

const initialState: FactState = {
  fact: null,
  factTypes: [],
  inEditMode: false,
  inCreateMode: false,
  isReady: false,
  personTypes: [],
  resourceTypes: [],
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
      personTypeService = inject(PersonTypeService),
      resourceTypeService = inject(ResourceTypeService),
      tagService = inject(TagService),
      toastService = inject(ToastService),
      detailStore = inject(DetailStore),
      refreshService = inject(RefreshService),
    ) => ({
      async initialize(factId: string) {
        patchState(store, setPending());
        const { factResp, factTypesResp, personTypesResp, resourceTypesResp } =
          await firstValueFrom(
            forkJoin({
              factResp: factService.getFact(factId),
              factTypesResp: factTypeService.getFactTypes({}),
              personTypesResp: personTypeService.getPersonTypes({}),
              resourceTypesResp: resourceTypeService.getResourceTypes({}),
            }),
          );
        if (factResp.errors) {
          patchState(store, { isReady: true }, setErrors(factResp.errors));

          toastService.sendMessage(
            toastService.createCrudMessage('Fact', 'Fetching', false),
            ToastLevel.ERROR,
          );
        } else if (factTypesResp.errors) {
          patchState(store, { isReady: true }, setErrors(factTypesResp.errors));

          toastService.sendMessage(
            toastService.createCrudMessage('Fact Types', 'Fetching', false),
            ToastLevel.ERROR,
          );
        } else if (personTypesResp.errors) {
          patchState(
            store,
            { isReady: true },
            setErrors(personTypesResp.errors),
          );

          toastService.sendMessage(
            toastService.createCrudMessage('Person Types', 'Fetching', false),
            ToastLevel.ERROR,
          );
        } else if (resourceTypesResp.errors) {
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
              fact: factResp.data,
              factTypes: factTypesResp.data,
              personTypes: personTypesResp.data,
              resourceTypes: resourceTypesResp.data,
              isReady: true,
            },
            setFulfilled(),
          );
        }
      },
      async initializeForCreate() {
        patchState(store, setPending());
        const { factTypesResp, personTypesResp, resourceTypesResp } =
          await firstValueFrom(
            forkJoin({
              factTypesResp: factTypeService.getFactTypes({}),
              personTypesResp: personTypeService.getPersonTypes({}),
              resourceTypesResp: resourceTypeService.getResourceTypes({}),
            }),
          );
        if (factTypesResp.errors) {
          patchState(store, { isReady: true }, setErrors(factTypesResp.errors));

          toastService.sendMessage(
            toastService.createCrudMessage('Fact Types', 'Fetching', false),
            ToastLevel.ERROR,
          );
        } else if (personTypesResp.errors) {
          patchState(
            store,
            { isReady: true },
            setErrors(personTypesResp.errors),
          );

          toastService.sendMessage(
            toastService.createCrudMessage('Person Types', 'Fetching', false),
            ToastLevel.ERROR,
          );
        } else if (resourceTypesResp.errors) {
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
              factTypes: factTypesResp.data,
              personTypes: personTypesResp.data,
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
      async updateFact(updateFactFormData: FactUpdateType) {
        patchState(store, setPending());
        updateFactFormData.id = store.fact().id;
        if (updateFactFormData.factType && updateFactFormData.factType.id) {
          updateFactFormData.typeKey = updateFactFormData.factType.key;
        }
        if (
          updateFactFormData.dimensions &&
          typeof updateFactFormData.dimensions === 'string'
        ) {
          updateFactFormData.dimensions = JSON.parse(
            updateFactFormData.dimensions,
          );
        }

        const resp = await firstValueFrom(
          factService.update(updateFactFormData),
        );
        if (resp.errors) {
          patchState(store, setErrors(resp.errors));

          toastService.sendMessage(
            toastService.createCrudMessage('Fact', 'Updating', false),
            ToastLevel.ERROR,
          );
        } else {
          patchState(
            store,
            { fact: resp.data, inEditMode: false },
            setFulfilled(),
          );

          toastService.sendMessage(
            toastService.createCrudMessage('Fact', 'Updated'),
            ToastLevel.SUCCESS,
          );

          // refresh the list
          refreshService.triggerRefresh();
        }
      },
      async createFact(createFactFormData: FactType) {
        createFactFormData.dimensions = JSON.parse(
          createFactFormData.dimensions,
        );
        patchState(store, setPending());
        createFactFormData.typeKey = createFactFormData.factType.key;

        const resp = await firstValueFrom(
          factService.create(createFactFormData),
        );
        if (resp.errors) {
          patchState(store, setErrors(resp.errors));

          toastService.sendMessage(
            toastService.createCrudMessage('Fact', 'Creating', false),
            ToastLevel.ERROR,
          );
        } else {
          patchState(
            store,
            { fact: resp.data, inEditMode: false, inCreateMode: false },
            setFulfilled(),
          );

          toastService.sendMessage(
            toastService.createCrudMessage('Fact', 'Created'),
            ToastLevel.SUCCESS,
          );

          // refresh the list
          refreshService.triggerRefresh();
          // navigate to the new item
          detailStore.routeToNewDetailId(resp.data.id);
        }
      },
      async deleteFact() {
        patchState(store, setPending());
        const resp = await firstValueFrom(factService.delete(store.fact().id));
        if (resp && resp.errors) {
          patchState(store, setErrors(resp.errors));

          toastService.sendMessage(
            toastService.createCrudMessage('Fact', 'Deleting', false),
            ToastLevel.ERROR,
          );
        } else {
          patchState(store, { inEditMode: false }, setFulfilled());

          toastService.sendMessage(
            toastService.createCrudMessage('Fact', 'Deleted'),
            ToastLevel.SUCCESS,
          );

          // refresh the list
          refreshService.triggerRefresh();
          // clear the detail_id to close the drawer
          detailStore.clearDetailId();
        }
      },
      async setTags(tags: string[]) {
        patchState(store, setPending());
        const resp = await firstValueFrom(
          tagService.setTags(store.fact().id, 'facts', tags),
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
  withComputed(({ fact }) => ({
    tagStrings: computed(() => fact()?.tags?.map((tag: string) => tag) ?? []),
  })),
);
