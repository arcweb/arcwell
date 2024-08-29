import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { effect, inject } from '@angular/core';
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
      const resp = await firstValueFrom(authService.logout());
      if (resp && resp.errors) {
        patchState(store, { loginStatus: 'error' });
      } else {
        patchState(store, initialState);
      }
    },
  })),
  withComputed(state => {
    return {};
  }),
  withHooks({
    onInit(store) {
      effect(() => {
        // 👇 The effect is re-executed on state change.
        if (store.token() && !store.currentUser()) {
          console.log(
            'Have a token, but no currentUser.  Should call /me endpoint, but here?',
          );
        }
      });
    },
  }),
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
