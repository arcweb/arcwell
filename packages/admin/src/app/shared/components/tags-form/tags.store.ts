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
import {
  debounceTime,
  distinctUntilChanged,
  of,
  pipe,
  switchMap,
  tap,
} from 'rxjs';
import { TagService } from '@shared/services/tag.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';

interface PersonState {
  tags: string[];
  searchText: string;
  searchTags: string[];
  isReady: boolean;
  changesMade: boolean;
}

const initialState: PersonState = {
  tags: [],
  searchText: '',
  searchTags: [],
  isReady: false,
  changesMade: false,
};

export const TagStore = signalStore(
  withDevtools('tags'),
  withState(initialState),
  withRequestStatus(),
  withComputed(({ tags, searchTags }) => ({
    sortedTags: computed(() =>
      (tags() ?? []).sort((a, b) => a.localeCompare(b)),
    ),
    filteredSortedTags: computed(() =>
      (searchTags() ?? []).sort((a, b) => a.localeCompare(b)),
    ),
  })),
  withMethods((store, tagService = inject(TagService)) => ({
    resetForm() {
      patchState(store, { changesMade: false });
    },
    setObjectTags(tags: string[]) {
      patchState(store, { tags, isReady: true });
    },
    removeTag(tag: string) {
      const tags = store.tags();
      const index = tags.indexOf(tag);
      if (index >= 0) {
        tags.splice(index, 1);
        patchState(store, { tags: tags, changesMade: true });
      }
    },
    addNewTag(tag: string) {
      const tags = store.tags();
      if (!tags.includes(tag)) {
        tags.push(tag);
        patchState(store, {
          tags: tags,
          searchText: '',
          searchTags: [],
          changesMade: true,
        });
      } else {
        // Duplicate found, just ignore and reset the input
        patchState(store, {
          searchText: '',
          searchTags: [],
          changesMade: true,
        });
      }
    },
    searchTags: rxMethod<string>(
      pipe(
        debounceTime(500),
        distinctUntilChanged(),
        tap(searchString =>
          patchState(store, { searchText: searchString }, setPending()),
        ),
        switchMap(searchString => {
          if (searchString == null || searchString === '') {
            patchState(store, { searchText: '', searchTags: [] });
            return of([]);
          }
          return tagService
            .getTagsSimple({ search: searchString, limit: 50, offset: 0 })
            .pipe(
              tapResponse({
                next: tagsResp => {
                  if (tagsResp.errors) {
                    patchState(
                      store,
                      { isReady: true },
                      setErrors(tagsResp.errors),
                    );
                  } else {
                    patchState(
                      store,
                      {
                        searchTags: tagsResp.data,
                      },
                      setFulfilled(),
                    );
                  }
                },
                error: err => {
                  throw err;
                },
              }),
            );
        }),
      ),
    ),
  })),
);
