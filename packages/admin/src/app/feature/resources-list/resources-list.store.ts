import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import {
  withRequestStatus,
  setPending,
  setFulfilled,
  setErrors,
} from '@shared/store/request-status.feature';
import { inject } from '@angular/core';
import { ResourceModel } from '@shared/models/resource.model';
import { firstValueFrom, forkJoin } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { ResourceService } from '@shared/services/resource.service';
import { SortDirection } from '@angular/material/sort';
import { ToastService } from '@app/shared/services/toast.service';
import { ToastLevel } from '@app/shared/models';
import { ResourceTypeType } from '@app/shared/schemas/resource-type.schema';
import { ResourceTypeService } from '@app/shared/services/resource-type.service';
import { FeatureFilter } from '@app/shared/interfaces/feature-filter';

interface ResourceListState {
  resources: ResourceModel[];
  resourceTypes: ResourceTypeType[];
  limit: number;
  offset: number;
  totalData: number;
  pageIndex: number;
  sort: string;
  order: SortDirection;
  typeKey: string;
  search: { field: string; searchString: string }[];
  filters: FeatureFilter[];
}

const initialState: ResourceListState = {
  resources: [],
  resourceTypes: [],
  limit: 10,
  offset: 0,
  totalData: 0,
  pageIndex: 0,
  sort: 'name',
  order: 'asc',
  typeKey: '',
  search: [],
  filters: [],
};

export const ResourcesListStore = signalStore(
  withDevtools('resources'),
  withState(initialState),
  withRequestStatus(),
  withMethods(
    (
      store,
      resourceService = inject(ResourceService),
      resourceTyeService = inject(ResourceTypeService),
      toastService = inject(ToastService),
    ) => ({
      async load(props: {
        limit: number;
        offset: number;
        sort?: string;
        order?: SortDirection;
        pageIndex?: number;
        typeKey?: string;
        search?: { field: string; searchString: string }[];
        filters?: FeatureFilter[];
      }) {
        patchState(
          store,
          {
            ...initialState,
            ...props,
          },
          setPending(),
        );
        const { resourceResp, resourceTypeResp } = await firstValueFrom(
          forkJoin({
            resourceResp: resourceService.getResources(props),
            resourceTypeResp: resourceTyeService.getResourceTypes({}),
          }),
        );

        if (resourceResp.errors) {
          patchState(store, setErrors(resourceResp.errors));

          toastService.sendMessage(
            toastService.createCrudMessage('Resources', 'Fetching', false),
            ToastLevel.ERROR,
          );
        } else if (resourceTypeResp.errors) {
          patchState(store, setErrors(resourceTypeResp.errors));

          toastService.sendMessage(
            toastService.createCrudMessage('Resource Types', 'Fetching', false),
            ToastLevel.ERROR,
          );
        } else {
          patchState(
            store,
            {
              resources: resourceResp.data,
              totalData: resourceResp.meta.count,
              resourceTypes: resourceTypeResp.data,
            },
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
          resourceService.getResources({
            limit: store.limit(),
            offset: store.offset(),
            sort: store.sort(),
            order: store.order(),
            typeKey: store.typeKey(),
            search: store.search(),
            filters: store.filters(),
          }),
        );

        if (resp.errors) {
          patchState(store, setErrors(resp.errors));

          toastService.sendMessage(
            toastService.createCrudMessage('Resources', 'Fetching', false),
            ToastLevel.ERROR,
          );
        } else {
          patchState(
            store,
            { resources: resp.data, totalData: resp.meta.count },
            setFulfilled(),
          );
        }
      },
      async count() {
        patchState(store, setPending());
        const resp = await firstValueFrom(resourceService.count());
        if (resp.errors) {
          patchState(store, setErrors(resp.errors));

          toastService.sendMessage(
            toastService.createCrudMessage(
              'Resources Count',
              'Fetching',
              false,
            ),
            ToastLevel.ERROR,
          );
        } else {
          patchState(store, { totalData: resp.data.count }, setFulfilled());
        }
      },
    }),
  ),
);
