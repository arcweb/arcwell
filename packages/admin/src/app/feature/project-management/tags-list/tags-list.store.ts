import {
  patchState,
  signalStore,
  withHooks,
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
import { PageEvent } from '@angular/material/paginator';
import { TagModel } from '@app/shared/models/tag.model';
import { TagService } from '@app/shared/services/tag.service';

interface TagsListState {
  tags: TagModel[];
  limit: number;
  offset: number;
  totalData: number;
  pageIndex: number;
}

const initialState: TagsListState = {
  tags: [],
  limit: 10,
  offset: 0,
  totalData: 0,
  pageIndex: 0,
};

export const TagsListStore = signalStore(
  withDevtools('people'),
  withState(initialState),
  withRequestStatus(),
  withMethods((store, tagService = inject(TagService)) => ({
    async load(limit: number, offset: number) {
      const resp = await firstValueFrom(
        tagService.getTags({ limit: limit, offset: offset }),
      );
      if (resp.errors) {
        patchState(store, setErrors(resp.errors));
      } else {
        patchState(
          store,
          { tags: resp.data, totalData: resp.meta.count },
          setFulfilled(),
        );
      }
    },
    async loadPage(event: PageEvent) {
      const newOffset = event.pageIndex * event.pageSize;
      patchState(
        store,
        {
          offset: newOffset,
          pageIndex: event.pageIndex,
          limit: event.pageSize,
        },
        setPending(),
      );
      const resp = await firstValueFrom(
        tagService.getTags({ limit: store.limit(), offset: store.offset() }),
      );

      if (resp.errors) {
        patchState(store, setErrors(resp.errors));
      } else {
        patchState(
          store,
          { tags: resp.data, totalData: resp.meta.count },
          setFulfilled(),
        );
      }
    },
  })),
  withHooks({
    onInit(store) {
      store.load(store.limit(), store.offset());
    },
  }),
);
