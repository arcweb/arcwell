import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import {
  withRequestStatus,
  setPending,
  setFulfilled,
  setErrors,
} from '@shared/store/request-status.feature';
import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { TagType, TagUpdateType } from '@schemas/tag.schema';
import { TagService } from '@shared/services/tag.service';
import { ToastService } from '@shared/services/toast.service';
import { ToastLevel } from '@shared/models';

interface TagState {
  tag: TagType | null;
  inEditMode: boolean;
  inCreateMode: boolean;
  isReady: boolean;
}

const initialState: TagState = {
  tag: null,
  inEditMode: false,
  inCreateMode: false,
  isReady: false,
};

export const TagStore = signalStore(
  withDevtools('tag'),
  withState(initialState),
  withRequestStatus(),
  withMethods(
    (
      store,
      tagService = inject(TagService),
      toastService = inject(ToastService),
    ) => ({
      async initialize(tagId: string) {
        patchState(store, setPending());
        const resp = await firstValueFrom(tagService.getTag(tagId));
        if (resp.errors) {
          patchState(store, setErrors(resp.errors));
        } else {
          patchState(store, { tag: resp, isReady: true }, setFulfilled());
        }
      },

      async initializeForCreate() {
        patchState(store, setPending());
        // future calls may be added here
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

      async updateTag(updateTagFormData: TagUpdateType) {
        patchState(store, setPending());
        updateTagFormData.id = store.tag().id;
        if (updateTagFormData.tagType && updateTagFormData.tagType.id) {
          updateTagFormData.typeKey = updateTagFormData.tagType.key;
        }
        const resp = await firstValueFrom(tagService.update(updateTagFormData));
        if (resp.errors) {
          patchState(store, setErrors(resp.errors));
        } else {
          patchState(
            store,
            { tag: resp.data, inEditMode: false },
            setFulfilled(),
          );
          toastService.sendMessage('Updated tag.', ToastLevel.SUCCESS);
        }
      },

      async createTag(createTagFormData: TagType) {
        patchState(store, setPending());

        const resp = await firstValueFrom(tagService.create(createTagFormData));
        if (resp.errors) {
          patchState(store, setErrors(resp.errors));
        } else {
          // TODO: Do we need to do this if we are navigating away?
          patchState(
            store,
            { tag: resp.data, inEditMode: false },
            setFulfilled(),
          );
        }
      },

      async deleteTag() {
        patchState(store, setPending());
        const resp = await firstValueFrom(tagService.delete(store.tag().id));
        if (resp && resp.errors) {
          patchState(store, setErrors(resp.errors));
        } else {
          patchState(store, { inEditMode: false }, setFulfilled());
        }
      },

      async setTags(tags: string[]) {
        patchState(store, setPending());
        const resp = await firstValueFrom(
          tagService.setTags(store.tag().id, 'people', tags),
        );
        if (resp && resp.errors) {
          patchState(store, setErrors(resp.errors));
        } else {
          patchState(store, setFulfilled());
        }
      },
    }),
  ),
);
