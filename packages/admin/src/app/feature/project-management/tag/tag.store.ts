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
import { EventType } from '@app/shared/schemas/event.schema';
import { FactType } from '@app/shared/schemas/fact.schema';
import { ResourceType } from '@app/shared/schemas/resource.schema';
import { UserType } from '@app/shared/schemas/user.schema';

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
  eventsCount: number;
  factsCount: number;
  peopleCount: number;
  resourcesCount: number;
  usersCount: number;
  eventsListOptions: RelatedListState;
  factsListOptions: RelatedListState;
  peopleListOptions: RelatedListState;
  resourcesListOptions: RelatedListState;
  usersListOptions: RelatedListState;
  events: EventType[];
  facts: FactType[];
  people: PersonType[];
  resources: ResourceType[];
  users: UserType[];
}

const initialListState = {
  limit: 10,
  offset: 0,
  pageIndex: 0,
};

const initialEventsListState: RelatedListState = {
  ...initialListState,
  order: 'desc',
  sort: 'startedAt',
};

const initialFactsListState: RelatedListState = {
  ...initialListState,
  order: 'desc',
  sort: 'observedAt',
};

const initialPeopleListState: RelatedListState = {
  ...initialListState,
  order: 'asc',
  sort: 'familyName',
};

const initialResourcesListState: RelatedListState = {
  ...initialListState,
  order: 'asc',
  sort: 'name',
};

// Users doesn't have sort on the backend so the sort properties will be ignored.
// Doing this so it matches the other types.
const initialUsersListState: RelatedListState = {
  ...initialListState,
  order: 'asc',
  sort: 'name',
};

// Keep the related content counts and lists separate so pagination updates on one type won't
// effect the other types
const initialState: TagState = {
  tag: null,
  inEditMode: false,
  inCreateMode: false,
  isReady: false,
  eventsListOptions: initialEventsListState,
  factsListOptions: initialFactsListState,
  peopleListOptions: initialPeopleListState,
  resourcesListOptions: initialResourcesListState,
  usersListOptions: initialUsersListState,
  eventsCount: 0,
  factsCount: 0,
  peopleCount: 0,
  resourcesCount: 0,
  usersCount: 0,
  events: [],
  facts: [],
  people: [],
  resources: [],
  users: [],
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
            eventsListOptions: initialEventsListState,
            factsListOptions: initialFactsListState,
            peopleListOptions: initialPeopleListState,
            resourcesListOptions: initialResourcesListState,
            usersListOptions: initialUsersListState,
          });
          patchState(
            store,
            {
              eventsCount: store.tag().eventsCount,
              factsCount: store.tag().factsCount,
              peopleCount: store.tag().peopleCount,
              resourcesCount: store.tag().resourcesCount,
              usersCount: store.tag().usersCount,
              events: store.tag().events,
              facts: store.tag().facts,
              people: store.tag().people,
              resources: store.tag().resources,
              users: store.tag().users,
            },
            setFulfilled(),
          );
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
            eventsCount: 0,
            factsCount: 0,
            peopleCount: 0,
            resourcesCount: 0,
            usersCount: 0,
            eventsListOptions: initialEventsListState,
            factsListOptions: initialFactsListState,
            peopleListOptions: initialPeopleListState,
            resourcesListOptions: initialResourcesListState,
            usersListOptions: initialUsersListState,
            events: [],
            facts: [],
            people: [],
            resources: [],
            users: [],
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
            eventsListOptions: initialEventsListState,
            factsListOptions: initialFactsListState,
            peopleListOptions: initialPeopleListState,
            resourcesListOptions: initialResourcesListState,
            usersListOptions: initialUsersListState,
          });
          patchState(
            store,
            {
              eventsCount: store.tag().eventsCount,
              factsCount: store.tag().factsCount,
              peopleCount: store.tag().peopleCount,
              resourcesCount: store.tag().resourcesCount,
              usersCount: store.tag().usersCount,
              events: store.tag().events,
              facts: store.tag().facts,
              people: store.tag().people,
              resources: store.tag().resources,
              users: store.tag().users,
            },
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
            {
              tag: resp,
              inEditMode: false,
              inCreateMode: false,
              eventsListOptions: initialEventsListState,
              factsListOptions: initialFactsListState,
              peopleListOptions: initialPeopleListState,
              resourcesListOptions: initialResourcesListState,
              usersListOptions: initialUsersListState,
              eventsCount: 0,
              factsCount: 0,
              peopleCount: 0,
              resourcesCount: 0,
              usersCount: 0,
              events: [],
              facts: [],
              people: [],
              resources: [],
              users: [],
            },
            setFulfilled(),
          );

          toastService.sendMessage('Created tag.', ToastLevel.SUCCESS);

          // navigate to the newly created item and don't save the current route in the history
          router.navigateByUrl(`/project-management/tags/${store.tag().id}`, {
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
              eventsListOptions: initialEventsListState,
              factsListOptions: initialFactsListState,
              peopleListOptions: initialPeopleListState,
              resourcesListOptions: initialResourcesListState,
              usersListOptions: initialUsersListState,
              eventsCount: 0,
              factsCount: 0,
              peopleCount: 0,
              resourcesCount: 0,
              usersCount: 0,
              events: [],
              facts: [],
              people: [],
              resources: [],
              users: [],
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
        let stateCountProperty = '';
        let listOptions: DeepSignal<RelatedListState> = store.peopleListOptions;
        let initialState;

        switch (objectType) {
          case 'events':
            stateListProperty = 'eventsListOptions';
            stateCountProperty = 'eventsCount';
            listOptions = store.eventsListOptions;
            initialState = initialEventsListState;
            break;
          case 'facts':
            stateListProperty = 'factsListOptions';
            stateCountProperty = 'factsCount';
            listOptions = store.factsListOptions;
            initialState = initialFactsListState;
            break;
          case 'people':
            stateListProperty = 'peopleListOptions';
            stateCountProperty = 'peopleCount';
            listOptions = store.peopleListOptions;
            initialState = initialPeopleListState;
            break;
          case 'resources':
            stateListProperty = 'resourcesListOptions';
            stateCountProperty = 'resourcesCount';
            listOptions = store.resourcesListOptions;
            initialState = initialResourcesListState;
            break;
          case 'users':
            stateListProperty = 'usersListOptions';
            stateCountProperty = 'usersCount';
            listOptions = store.usersListOptions;
            initialState = initialUsersListState;
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
            {
              [stateCountProperty]: store.tag()[stateCountProperty],
              [objectType]: store.tag()[objectType],
            },
            setFulfilled(),
          );
        }
      },
    }),
  ),
);
