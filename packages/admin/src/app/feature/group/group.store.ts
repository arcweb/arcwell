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
import { GroupType, GroupUpdateType } from '@schemas/group.schema';
import { GroupService } from '@shared/services/group.service';
import { ToastService } from '@shared/services/toast.service';
import { ToastLevel } from '@shared/models';
import { SortDirection } from '@angular/material/sort';
import { PersonType } from '@app/shared/schemas/person.schema';
import { EventType } from '@app/shared/schemas/event.schema';
import { FactType } from '@app/shared/schemas/fact.schema';
import { ResourceType } from '@app/shared/schemas/resource.schema';
import { UserType } from '@app/shared/schemas/user.schema';
import { RefreshService } from '@app/shared/services/refresh.service';
import { DetailStore } from '@feature/detail/detail.store';

interface RelatedListState {
  limit: number;
  offset: number;
  pageIndex: number;
  sort: string;
  order: SortDirection;
}

interface GroupState {
  group: GroupType | null;
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
const initialState: GroupState = {
  group: null,
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

export const GroupStore = signalStore(
  withDevtools('group'),
  withState(initialState),
  withRequestStatus(),
  withMethods(
    (
      store,
      groupService = inject(GroupService),
      toastService = inject(ToastService),
      detailStore = inject(DetailStore),
      refreshService = inject(RefreshService),
    ) => ({
      async initialize(groupId: string) {
        patchState(store, setPending());
        const resp = await firstValueFrom(
          groupService.getGroupWithRelated({
            id: groupId,
            objectType: 'all',
            limit: initialListState.limit,
            offset: initialListState.offset,
          }),
        );
        if (resp.errors) {
          patchState(store, setErrors(resp.errors));

          toastService.sendMessage(
            toastService.createCrudMessage('Group', 'Fetching', false),
            ToastLevel.ERROR,
          );
        } else {
          patchState(store, {
            group: resp,
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
              eventsCount: store.group().eventsCount,
              factsCount: store.group().factsCount,
              peopleCount: store.group().peopleCount,
              resourcesCount: store.group().resourcesCount,
              usersCount: store.group().usersCount,
              events: store.group().events,
              facts: store.group().facts,
              people: store.group().people,
              resources: store.group().resources,
              users: store.group().users,
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

      async updateGroup(updateGroupFormData: GroupUpdateType) {
        patchState(store, setPending());
        updateGroupFormData.id = store.group().id;
        if (updateGroupFormData.groupType && updateGroupFormData.groupType.id) {
          updateGroupFormData.typeKey = updateGroupFormData.groupType.key;
        }
        const resp = await firstValueFrom(
          groupService.update(updateGroupFormData),
        );
        if (resp.errors) {
          patchState(store, setErrors(resp.errors));

          toastService.sendMessage(
            toastService.createCrudMessage('Group', 'Updating', false),
            ToastLevel.ERROR,
          );
        } else {
          patchState(store, {
            group: resp,
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
              eventsCount: store.group().eventsCount,
              factsCount: store.group().factsCount,
              peopleCount: store.group().peopleCount,
              resourcesCount: store.group().resourcesCount,
              usersCount: store.group().usersCount,
              events: store.group().events,
              facts: store.group().facts,
              people: store.group().people,
              resources: store.group().resources,
              users: store.group().users,
            },
            setFulfilled(),
          );

          toastService.sendMessage(
            toastService.createCrudMessage('Group', 'Updated'),
            ToastLevel.SUCCESS,
          );
          // refresh the list
          refreshService.triggerRefresh();
        }
      },

      async createGroup(createGroupFormData: GroupType) {
        patchState(store, setPending());

        const resp = await firstValueFrom(
          groupService.create(createGroupFormData),
        );
        if (resp.errors) {
          patchState(store, setErrors(resp.errors));

          toastService.sendMessage(
            toastService.createCrudMessage('Group', 'Creating', false),
            ToastLevel.ERROR,
          );
        } else {
          patchState(
            store,
            {
              group: resp,
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

          toastService.sendMessage(
            toastService.createCrudMessage('Group', 'Created'),
            ToastLevel.SUCCESS,
          );

          // refresh the list
          refreshService.triggerRefresh();
          // navigate to the newly created item
          detailStore.routeToNewDetailId(resp.id);
        }
      },

      async deleteGroup() {
        patchState(store, setPending());
        const resp = await firstValueFrom(
          groupService.delete(store.group().id),
        );
        if (resp && resp.errors) {
          patchState(store, setErrors(resp.errors));

          toastService.sendMessage(
            toastService.createCrudMessage('Group', 'Deleting', false),
            ToastLevel.ERROR,
          );
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

          toastService.sendMessage(
            toastService.createCrudMessage('Group', 'Deleted'),
            ToastLevel.SUCCESS,
          );

          // refresh the list
          refreshService.triggerRefresh();
          // clear the detail_id to close the drawer
          detailStore.clearDetailId();
        }
      },

      async setGroups(groups: string[]) {
        patchState(store, setPending());
        const resp = await firstValueFrom(
          groupService.setGroups(store.group().id, 'people', groups),
        );
        if (resp && resp.errors) {
          patchState(store, setErrors(resp.errors));

          toastService.sendMessage(
            toastService.createCrudMessage('Group', 'Updating', false),
            ToastLevel.ERROR,
          );
        } else {
          patchState(store, setFulfilled());

          toastService.sendMessage(
            toastService.createCrudMessage('Group', 'Updated'),
            ToastLevel.SUCCESS,
          );
        }
      },

      async loadRelatedPage(props: {
        objectType: string;
        limit: number;
        offset: number;
        pageIndex: number;
        sort: string;
        order: SortDirection;
      }) {
        let stateListProperty = '';
        let stateCountProperty = '';
        let listOptions: DeepSignal<RelatedListState> = store.peopleListOptions;
        let initialState;

        switch (props.objectType) {
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
              offset: props.offset,
              pageIndex: props.pageIndex,
              limit: props.limit,
              sort: props.sort,
              order: props.order,
            },
          },
          setPending(),
        );
        const resp = await firstValueFrom(
          groupService.getGroupWithRelated({
            id: store.group().id,
            objectType: props.objectType,
            limit: listOptions().limit,
            offset: listOptions().offset,
            sort: listOptions().sort,
            order: listOptions().order,
          }),
        );

        if (resp.errors) {
          patchState(store, setErrors(resp.errors));

          toastService.sendMessage(
            toastService.createCrudMessage(
              'Group Relations',
              'Fetching',
              false,
            ),
            ToastLevel.ERROR,
          );
        } else {
          patchState(store, {
            group: resp,
            isReady: true,
          });
          patchState(
            store,
            {
              [stateCountProperty]: store.group()[stateCountProperty],
              [props.objectType]: store.group()[props.objectType],
            },
            setFulfilled(),
          );
        }
      },
    }),
  ),
);
