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
import { ToastService } from '@app/shared/services/toast.service';
import { ToastLevel } from '@app/shared/models';

interface TagsListState {
  tags: TagModel[];
  limit: number;
  offset: number;
  totalData: number;
  pageIndex: number;
  search: { field: string; searchString: string }[];
  csv?: Blob;
}

const initialState: TagsListState = {
  tags: [],
  limit: 10,
  offset: 0,
  totalData: 0,
  pageIndex: 0,
  search: [],
  csv: undefined,
};

export const TagsListStore = signalStore(
  withDevtools('tags'),
  withState(initialState),
  withRequestStatus(),
  withMethods(
    (
      store,
      tagService = inject(TagService),
      toastService = inject(ToastService),
    ) => ({
      async load(
        limit: number,
        offset: number,
        search?: { field: string; searchString: string }[],
      ) {
        patchState(
          store,
          { ...initialState, limit, offset, search },
          setPending(),
        );
        const resp = await firstValueFrom(
          tagService.getTags({ limit, offset, search }),
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
          tagService.getTags({
            limit: store.limit(),
            offset: store.offset(),
            search: store.search(),
          }),
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
      async count() {
        patchState(store, setPending());
        const resp = await firstValueFrom(tagService.count());
        if (resp.errors) {
          patchState(store, setErrors(resp.errors));
        } else {
          patchState(store, { totalData: resp.data.count }, setFulfilled());
        }
      },
      async getCsv() {
        patchState(store, setPending());
        const resp = await firstValueFrom(tagService.getCsv());
        if (resp.errors || Object.keys(resp).includes('errors')) {
          patchState(store, setErrors(resp.errors));

          toastService.sendMessage(
            toastService.createCrudMessage('Tags CSV', 'Fetching', false),
            ToastLevel.ERROR,
          );
        } else {
          const blob = new Blob([resp], { type: 'text/csv' });
          const data = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = data;
          link.download = 'tags.csv';
          link.click();
          patchState(store, { csv: resp }, setFulfilled());
        }
      },
    }),
  ),
  withHooks({
    onInit(store) {
      store.load(store.limit(), store.offset(), []);
    },
  }),
);
