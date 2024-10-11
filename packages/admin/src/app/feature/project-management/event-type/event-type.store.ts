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
import { EventType, EventUpdateType } from '@shared/schemas/event.schema';
import { EventTypeService } from '@shared/services/event-type.service';
import { TagService } from '@shared/services/tag.service';
import { TagType } from '@schemas/tag.schema';
import { FeatureStore } from '@app/shared/store/feature.store';
import { Router } from '@angular/router';
import { ToastService } from '@app/shared/services/toast.service';
import { ToastLevel } from '@app/shared/models';
import { DetailStore } from '../detail/detail.store';

interface EventTypeState {
  eventType: EventType | null;
  inEditMode: boolean;
  inCreateMode: boolean;
  isReady: boolean;
}

const initialState: EventTypeState = {
  eventType: null,
  inEditMode: false,
  inCreateMode: false,
  isReady: false,
};

export const EventTypeStore = signalStore(
  withDevtools('eventType'),
  withState(initialState),
  withRequestStatus(),
  withMethods(
    (
      store,
      eventTypeService = inject(EventTypeService),
      tagService = inject(TagService),
      featureStore = inject(FeatureStore),
      router = inject(Router),
      toastService = inject(ToastService),
      detailStore = inject(DetailStore),
    ) => ({
      async initialize(eventTypeId: string) {
        patchState(store, setPending());
        const resp = await firstValueFrom(
          eventTypeService.getEventType(eventTypeId),
        );
        if (resp.errors) {
          patchState(store, { isReady: true }, setErrors(resp.errors));
        } else {
          patchState(
            store,
            {
              eventType: resp.data,
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
      async update(updateEventFormData: EventUpdateType) {
        patchState(store, setPending());
        updateEventFormData.id = store.eventType().id;
        if (updateEventFormData.eventType && updateEventFormData.eventType.id) {
          updateEventFormData.eventTypeId = updateEventFormData.eventType.id;
        }
        const resp = await firstValueFrom(
          eventTypeService.update(updateEventFormData),
        );
        if (resp.errors) {
          patchState(store, setErrors(resp.errors));
        } else {
          // load the feature list with the latest list of subfeatures
          featureStore.load();

          patchState(
            store,
            { eventType: resp.data, inEditMode: false },
            setFulfilled(),
          );

          toastService.sendMessage('Updated event type.', ToastLevel.SUCCESS);
        }
      },
      async create(createEventTypeFormData: EventType) {
        patchState(store, setPending());
        const resp = await firstValueFrom(
          eventTypeService.create(createEventTypeFormData),
        );
        if (resp.errors) {
          patchState(store, setErrors(resp.errors));
        } else {
          // load the feature list with the latest list of subfeatures
          featureStore.load();

          patchState(
            store,
            { eventType: resp.data, inEditMode: false, inCreateMode: false },
            setFulfilled(),
          );

          toastService.sendMessage('Created event type.', ToastLevel.SUCCESS);

          // navigate the user to the newly created item
          detailStore.routeToNewDetailId(resp.data.id);
        }
      },
      async delete() {
        patchState(store, setPending());
        const resp = await firstValueFrom(
          eventTypeService.delete(store.eventType().id),
        );
        if (resp && resp.errors) {
          patchState(store, setErrors(resp.errors));
        } else {
          // load the feature list with the latest list of subfeatures
          featureStore.load();

          patchState(
            store,
            { inEditMode: false, inCreateMode: false },
            setFulfilled(),
          );
        }
      },
      async setTags(tags: string[]) {
        patchState(store, setPending());
        const resp = await firstValueFrom(
          tagService.setTags(store.eventType().id, 'event_types', tags),
        );
        if (resp && resp.errors) {
          patchState(store, setErrors(resp.errors));
        } else {
          patchState(store, setFulfilled());
        }
      },
    }),
  ),
  withComputed(({ eventType }) => ({
    tagStrings: computed(
      () => eventType()?.tags?.map((tag: TagType) => tag.pathname) ?? [],
    ),
  })),
);
