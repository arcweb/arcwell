import {
  ApplicationConfig,
  provideZoneChangeDetection,
  isDevMode,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { Settings } from 'luxon';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { provideStoreDevtools } from '@ngrx/store-devtools';
import { HeaderInterceptor } from '@shared/interceptors/header.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([HeaderInterceptor])),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
  ],
};

// needed because .toISO() can return null normally, this overrides that behavior
Settings.throwOnInvalid = true;
declare module 'luxon' {
  interface TSSettings {
    throwOnInvalid: true;
  }
}
