import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { ActivatedRoute, Router } from '@angular/router';
import { inject } from '@angular/core';

interface DetailState {
  isDrawerOpen: boolean;
}

const initialState: DetailState = {
  isDrawerOpen: false,
};

export const DetailStore = signalStore(
  { providedIn: 'root' },
  withDevtools('detail'),
  withState(initialState),
  withMethods(
    (
      store,
      router = inject(Router),
      activatedRoute = inject(ActivatedRoute),
    ) => ({
      setDrawerOpen(open: boolean) {
        patchState(store, { isDrawerOpen: open });
      },
      clearDetailId() {
        router.navigate([], {
          relativeTo: activatedRoute,
          queryParams: {},
        });
      },
      routeToNewDetailId(detailId: string) {
        router.navigate([], {
          relativeTo: activatedRoute,
          queryParams: { detail_id: detailId },
        });
      },
    }),
  ),
);
