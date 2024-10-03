import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { ConfigModel } from '../models/config.model';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import {
  setFulfilled,
  setPending,
  withRequestStatus,
} from './request-status.feature';
import { inject } from '@angular/core';
import { ConfigService } from '../services/config.service';
import { lastValueFrom } from 'rxjs';

interface ConfigState {
  config: ConfigModel | null;
}

const initialState: ConfigState = {
  config: null,
};

export const ConfigStore = signalStore(
  { providedIn: 'root' },
  withDevtools('config'),
  withState(initialState),
  withRequestStatus(),
  withMethods((store, configService = inject(ConfigService)) => ({
    async load() {
      patchState(store, setPending());
      const resp: ConfigModel = await lastValueFrom(configService.getConfig());
      patchState(store, { config: resp }, setFulfilled());
    },
  })),
);
