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
import { PersonType, PersonUpdateType } from '@shared/schemas/person.schema';
import { PersonTypeService } from '@shared/services/person-type.service';
import { TagService } from '@shared/services/tag.service';
import { FeatureStore } from '@app/shared/store/feature.store';
import { ToastService } from '@app/shared/services/toast.service';
import { ToastLevel } from '@app/shared/models';
import { Router } from '@angular/router';

interface PersonTypeState {
  personType: PersonType | null;
  inEditMode: boolean;
  inCreateMode: boolean;
  isReady: boolean;
}

const initialState: PersonTypeState = {
  personType: null,
  inEditMode: false,
  inCreateMode: false,
  isReady: false,
};

export const PersonTypeStore = signalStore(
  withDevtools('personType'),
  withState(initialState),
  withRequestStatus(),
  withMethods(
    (
      store,
      personTypeService = inject(PersonTypeService),
      tagService = inject(TagService),
      featureStore = inject(FeatureStore),
      router = inject(Router),
      toastService = inject(ToastService),
    ) => ({
      async initialize(personTypeId: string) {
        patchState(store, setPending());
        const resp = await firstValueFrom(
          personTypeService.getPersonType(personTypeId),
        );
        if (resp.errors) {
          patchState(store, { isReady: true }, setErrors(resp.errors));
        } else {
          patchState(
            store,
            {
              personType: resp.data,
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
      async update(updatePersonFormData: PersonUpdateType) {
        patchState(store, setPending());
        updatePersonFormData.id = store.personType().id;
        if (
          updatePersonFormData.personType &&
          updatePersonFormData.personType.id
        ) {
          updatePersonFormData.personTypeId =
            updatePersonFormData.personType.id;
        }
        const resp = await firstValueFrom(
          personTypeService.update(updatePersonFormData),
        );
        if (resp.errors) {
          patchState(store, setErrors(resp.errors));
        } else {
          // load the feature list with the latest list of subfeatures
          featureStore.load();

          toastService.sendMessage('Person Type updated.', ToastLevel.SUCCESS);

          patchState(
            store,
            { personType: resp.data, inEditMode: false },
            setFulfilled(),
          );
        }
      },
      async create(createPersonTypeFormData: PersonType) {
        patchState(store, setPending());
        const resp = await firstValueFrom(
          personTypeService.create(createPersonTypeFormData),
        );
        if (resp.errors) {
          patchState(store, setErrors(resp.errors));
        } else {
          // load the feature list with the latest list of subfeatures
          featureStore.load();

          patchState(
            store,
            { personType: resp.data, inEditMode: false, inCreateMode: false },
            setFulfilled(),
          );

          toastService.sendMessage('Person Type created.', ToastLevel.SUCCESS);
          console.log('resp', resp);
          router.navigate([], {
            relativeTo: router.routerState.root,
            queryParams: { detail_id: resp.data.id },
          });
        }
      },
      async delete() {
        patchState(store, setPending());
        const resp = await firstValueFrom(
          personTypeService.delete(store.personType().id),
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
          tagService.setTags(store.personType().id, 'person_types', tags),
        );
        if (resp && resp.errors) {
          patchState(store, setErrors(resp.errors));
        } else {
          patchState(store, setFulfilled());
        }
      },
    }),
  ),
  withComputed(({ personType }) => ({
    tagStrings: computed(
      () => personType()?.tags?.map((tag: string) => tag) ?? [],
    ),
  })),
);
