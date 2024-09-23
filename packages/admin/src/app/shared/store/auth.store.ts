import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { AuthService } from '@shared/data-access/auth.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { Credentials } from '@shared/interfaces/credentials';
import { EMPTY, firstValueFrom, map, pipe, switchMap, tap } from 'rxjs';
import { UserModel } from '@shared/models/user.model';
import { catchError } from 'rxjs/operators';
import {
  withDevtools,
  withStorageSync,
} from '@angular-architects/ngrx-toolkit';

export type LoginStatus =
  | 'none'
  | 'pending'
  | 'authenticating'
  | 'success'
  | 'error';

interface AuthState {
  token: string | null;
  role: string | null;
  policies: string[];
  currentUser: UserModel | null;
  loginStatus: LoginStatus;
}

const initialState: AuthState = {
  token: null,
  role: null,
  policies: [],
  currentUser: null,
  loginStatus: 'none',
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withDevtools('auth'),
  withState(initialState),
  withMethods((store, authService = inject(AuthService)) => ({
    login: rxMethod<Credentials>(
      pipe(
        tap(() => {
          patchState(store, { loginStatus: 'authenticating' });
        }),
        switchMap(credentials => {
          return authService
            .loginTo({
              email: credentials.email,
              password: credentials.password,
            })
            .pipe(
              map(response => {
                return patchState(store, {
                  token: response?.token.value,
                  currentUser: response?.user,
                  loginStatus: 'success',
                });
              }),
              catchError(err => {
                console.error('err=', err);
                patchState(store, { loginStatus: 'error' });
                return EMPTY;
              }),
            );
        }),
      ),
    ),
    async logout() {
      patchState(store, { loginStatus: 'pending' });
      await firstValueFrom(authService.logout());
      // Don't need to check if the logout was successful, just reset state
      patchState(store, initialState);
    },
    async clearStore() {
      patchState(store, initialState);
    },
    async loadCurrentUser() {
      patchState(store, { loginStatus: 'pending' });
      const user = await firstValueFrom(authService.me());
      if (user.errors) {
        this.logout();
      }
      patchState(store, { currentUser: user, loginStatus: 'success' });
    },
    async forgotPassword(email: string) {
      patchState(store, { loginStatus: 'pending' });
      await firstValueFrom(authService.sendPasswordReset(email));
      patchState(store, { loginStatus: 'none' });
    },
  })),
  withStorageSync({
    key: '_arcwell_auth_', // key used when writing to/reading from storage
    autoSync: true, // read from storage on init and write on state changes - `true` by default

    // TODO: Commenting out this select temporarily, so that currentUser is loaded from localstorage.
    //  Only the token should be stored, but calling /me endpoint isn't working yet
    select: (state: AuthState): Partial<AuthState> => {
      return { token: state.token };
    }, // projection to keep specific slices in sync
    // parse: (stateString: string) => State, // custom parsing from storage - `JSON.parse` by default
    // stringify: (state: User) => string, // custom stringification - `JSON.stringify` by default
    storage: () => localStorage, // factory to select storage to sync with
  }),
);
