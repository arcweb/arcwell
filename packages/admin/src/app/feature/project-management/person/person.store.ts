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
import { PersonService } from '@shared/services/person.service';
import { computed, inject } from '@angular/core';
import {
  debounceTime,
  distinctUntilChanged,
  firstValueFrom,
  forkJoin,
  of,
  pipe,
  switchMap,
  tap,
} from 'rxjs';
import { PersonType, PersonUpdateType } from '@shared/schemas/person.schema';
import { PersonTypeService } from '@shared/services/person-type.service';
import { PersonTypeType } from '@schemas/person-type.schema';
import { TagType } from '@schemas/tag.schema';
import { TagService } from '@shared/services/tag.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';

interface PersonState {
  person: PersonType | null;
  tags: TagType[];
  searchText: string;
  searchTags: TagType[];
  personTypes: PersonTypeType[];
  inEditMode: boolean;
  inCreateMode: boolean;
  isReady: boolean;
}

const initialState: PersonState = {
  person: null,
  tags: [],
  searchText: '',
  searchTags: [],
  personTypes: [],
  inEditMode: false,
  inCreateMode: false,
  isReady: false,
};

export const PersonStore = signalStore(
  withDevtools('person'),
  withState(initialState),
  withRequestStatus(),
  withComputed(({ tags, searchTags }) => ({
    sortedTags: computed(
      () => tags().sort((a, b) => b.pathname.localeCompare(a.pathname)) ?? [],
    ),

    filteredTags: computed(
      () =>
        searchTags().sort((a, b) => b.pathname.localeCompare(a.pathname)) ?? [],
    ),
  })),
  withMethods(
    (
      store,
      personService = inject(PersonService),
      personTypeService = inject(PersonTypeService),
      tagService = inject(TagService),
    ) => ({
      async initialize(personId: string) {
        patchState(store, setPending());
        const { personResp, personTypesResp } = await firstValueFrom(
          forkJoin({
            personResp: personService.getPerson(personId),
            personTypesResp: personTypeService.getPersonTypes(),
          }),
        );
        if (personResp.errors) {
          patchState(store, { isReady: true }, setErrors(personResp.errors));
        } else if (personTypesResp.errors) {
          patchState(
            store,
            { isReady: true },
            setErrors(personTypesResp.errors),
          );
        } else {
          patchState(
            store,
            {
              person: personResp.data,
              tags: personResp.data.tags,
              personTypes: personTypesResp.data,
              isReady: true,
            },
            setFulfilled(),
          );
        }
      },
      async initializeForCreate() {
        patchState(store, setPending());
        const personTypesResp = await firstValueFrom(
          personTypeService.getPersonTypes(),
        );
        if (personTypesResp.errors) {
          patchState(
            store,
            { isReady: true },
            setErrors(personTypesResp.errors),
          );
        } else {
          patchState(
            store,
            {
              personTypes: personTypesResp.data,
              inCreateMode: true,
              inEditMode: true,
              isReady: true,
            },
            setFulfilled(),
          );
        }
      },
      async toggleEditMode() {
        patchState(store, { inEditMode: !store.inEditMode() });
      },
      async updatePerson(updatePersonFormData: PersonUpdateType) {
        patchState(store, setPending());
        updatePersonFormData.id = store.person().id;
        if (
          updatePersonFormData.personType &&
          updatePersonFormData.personType.id
        ) {
          updatePersonFormData.typeKey = updatePersonFormData.personType.key;
        }
        const resp = await firstValueFrom(
          personService.update(updatePersonFormData),
        );
        if (resp.errors) {
          patchState(store, setErrors(resp.errors));
        } else {
          patchState(
            store,
            { person: resp.data, inEditMode: false },
            setFulfilled(),
          );
        }
      },
      async createPerson(createPersonFormData: PersonType) {
        console.log('createPersonFormData', createPersonFormData);
        patchState(store, setPending());
        createPersonFormData.typeKey = createPersonFormData.personType.key;

        const resp = await firstValueFrom(
          personService.create(createPersonFormData),
        );
        if (resp.errors) {
          patchState(store, setErrors(resp.errors));
        } else {
          // TODO: Do we need to do this if we are navigating away?
          patchState(
            store,
            { person: resp.data, inEditMode: false },
            setFulfilled(),
          );
        }
      },
      async deletePerson() {
        patchState(store, setPending());
        const resp = await firstValueFrom(
          personService.delete(store.person().id),
        );
        if (resp && resp.errors) {
          patchState(store, setErrors(resp.errors));
        } else {
          patchState(store, { inEditMode: false }, setFulfilled());
        }
      },
      removeTag(tag: string) {
        const tags = store.tags();
        const index = tags.indexOf(tag);
        if (index >= 0) {
          tags.splice(index, 1);
          patchState(store, { tags: tags });
        }
      },
      addTag(tag: string) {
        const tags = store.tags();
        if (!store.tags().includes(tag)) {
          tags.push({ pathname: tag });
          patchState(store, { tags: tags, searchText: '', searchTags: [] });
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
            return tagService.getTags(searchString, 50, 0).pipe(
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
    }),
  ),
);
