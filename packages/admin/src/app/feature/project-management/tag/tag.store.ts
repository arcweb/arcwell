import {
  DeepSignal,
  patchState,
  signalStore,
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
import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { TagType, TagUpdateType } from '@schemas/tag.schema';
import { TagService } from '@shared/services/tag.service';
import { ToastService } from '@shared/services/toast.service';
import { ToastLevel } from '@shared/models';
import { Router } from '@angular/router';
import { SortDirection } from '@angular/material/sort';
import { PersonType } from '@app/shared/schemas/person.schema';

interface RelatedListState {
  limit: number;
  offset: number;
  pageIndex: number;
  sort: string;
  order: SortDirection;
}

interface TagState {
  tag: TagType | null;
  inEditMode: boolean;
  inCreateMode: boolean;
  isReady: boolean;
  peopleListOptions: RelatedListState;
  people: PersonType[];
}

const initialListState = {
  limit: 10,
  offset: 0,
  pageIndex: 0,
};

const initialPeopleListState: RelatedListState = {
  ...initialListState,
  order: 'asc',
  sort: 'familyName',
};

// Keep the related content lists separate so pagination updates on one type won't
// effect the other types
const initialState: TagState = {
  tag: null,
  inEditMode: false,
  inCreateMode: false,
  isReady: false,
  peopleListOptions: initialPeopleListState,
  people: [],
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
      router = inject(Router),
    ) => ({
      async initialize(tagId: string) {
        patchState(store, setPending());
        const resp = await firstValueFrom(
          tagService.getTagWithRelated(
            tagId,
            'all',
            initialListState.limit,
            initialListState.offset,
          ),
        );
        if (resp.errors) {
          patchState(store, setErrors(resp.errors));
        } else {
          patchState(store, {
            tag: resp,
            isReady: true,
            peopleListOptions: initialPeopleListState,
          });
          patchState(store, { people: store.tag().people }, setFulfilled());
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
            peopleListOptions: initialPeopleListState,
            people: [],
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
          patchState(store, {
            tag: resp,
            inEditMode: false,
            peopleListOptions: initialPeopleListState,
          });
          patchState(store, { people: store.tag().people }, setFulfilled());
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
            {
              tag: resp.data,
              inEditMode: false,
              inCreateMode: false,
              peopleListOptions: initialPeopleListState,
              people: [],
            },
            setFulfilled(),
          );

          toastService.sendMessage('Created tag.', ToastLevel.SUCCESS);

          // navigate to the newly created item and don't save the current route in the history
          router.navigateByUrl(`/project-management/tags/${resp.data.id}`, {
            replaceUrl: true,
          });
        }
      },

      async deleteTag() {
        patchState(store, setPending());
        const resp = await firstValueFrom(tagService.delete(store.tag().id));
        if (resp && resp.errors) {
          patchState(store, setErrors(resp.errors));
        } else {
          patchState(
            store,
            {
              inEditMode: false,
              peopleListOptions: initialPeopleListState,
              people: [],
            },
            setFulfilled(),
          );
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

      async loadRelatedPage(
        objectType: string,
        limit: number,
        offset: number,
        pageIndex: number,
        sort: string,
        order: SortDirection,
      ) {
        let stateListProperty = '';
        let listOptions: DeepSignal<RelatedListState> = store.peopleListOptions;
        let initialState;

        switch (objectType) {
          case 'people':
            stateListProperty = 'peopleListOptions';
            listOptions = store.peopleListOptions;
            initialState = initialPeopleListState;
            break;
        }

        patchState(
          store,
          {
            [stateListProperty]: {
              ...initialState,
              offset,
              pageIndex,
              limit,
              sort,
              order,
            },
          },
          setPending(),
        );
        const resp = await firstValueFrom(
          tagService.getTagWithRelated(
            store.tag().id,
            objectType,
            listOptions().limit,
            listOptions().offset,
            listOptions().sort,
            listOptions().order,
          ),
        );

        if (resp.errors) {
          patchState(store, setErrors(resp.errors));
        } else {
          patchState(store, {
            tag: resp,
            isReady: true,
          });
          patchState(
            store,
            { [objectType]: store.tag()[objectType] },
            setFulfilled(),
          );
        }
      },
    }),
  ),
);
