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
import { firstValueFrom } from 'rxjs';
import { Title } from '@angular/platform-browser';

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
  withMethods(
    (
      store,
      configService = inject(ConfigService),
      titleService = inject(Title),
    ) => ({
      async load() {
        patchState(store, setPending());
        const resp: ConfigModel = await firstValueFrom(
          configService.getConfig(),
        );
        patchState(store, { config: resp }, setFulfilled());
        return resp;
      },
      async setTitle(featureTitle?: string) {
        if (!store.config()) {
          await this.load();
        }
        const title = ['Arcwell'];
        if (store.config()?.arcwell.name) {
          title.unshift(store.config()?.arcwell.name || '');
        }
        if (featureTitle) {
          title.unshift(featureTitle);
        }
        titleService.setTitle(title.join(' - '));
      },
    }),
  ),
);
