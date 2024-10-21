import { computed } from '@angular/core';
import { signalStoreFeature, withComputed, withState } from '@ngrx/signals';
import { ErrorResponseType } from '@shared/schemas/error.schema';

export type RequestStatus = 'idle' | 'pending' | 'fulfilled' | 'errored';
export interface RequestStatusState {
  requestStatus: RequestStatus;
  errors: ErrorResponseType[];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function withRequestStatus<_>() {
  return signalStoreFeature(
    withState<RequestStatusState>({
      requestStatus: 'idle',
      errors: [],
    }),
    withComputed(({ requestStatus }) => ({
      isPending: computed(() => requestStatus() === 'pending'),
      isFulfilled: computed(() => requestStatus() === 'fulfilled'),
      isErrored: computed(() => requestStatus() === 'errored'),
    })),
  );
}

export function setPending(): RequestStatusState {
  return { requestStatus: 'pending', errors: [] };
}

export function setFulfilled(): RequestStatusState {
  return { requestStatus: 'fulfilled', errors: [] };
}

export function setErrors(errors: ErrorResponseType[]): RequestStatusState {
  return { requestStatus: 'errored', errors: errors };
}
