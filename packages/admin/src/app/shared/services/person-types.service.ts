import { Injectable, inject } from '@angular/core';
import { PersonTypeModel } from '../models/person-type.model';
import {
  PersonTypeResponseType,
  PersonTypeType,
  deserializePersonType,
} from '../schemas/person-type.schema';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';
import { ErrorResponseType } from '../schemas/error.schema';

const apiUrl = 'http://localhost:3333';

@Injectable({
  providedIn: 'root',
})
export class PersonTypesService {
  private http: HttpClient = inject(HttpClient);

  getPersonTypes(): Observable<{ data: PersonTypeModel[]; meta: any }> {
    return this.http.get<PersonTypeResponseType>(`${apiUrl}/person_types`).pipe(
      tap((response: PersonTypeResponseType | ErrorResponseType) => {
        // validate response is success
        if (response.errors && response.errors.length > 0) {
          throw new Error(response.message);
        }
      }),
      map((response: PersonTypeResponseType) => ({
        // deserialize the data
        data: response.data.map((personType: PersonTypeType) =>
          deserializePersonType(personType),
        ),
        meta: response.meta,
      })),
    );
  }
}
