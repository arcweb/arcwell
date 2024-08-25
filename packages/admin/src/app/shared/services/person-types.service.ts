import { Injectable, inject } from '@angular/core';
import { PersonTypeModel } from '../models/person-type.model';
import {
  PersonTypeResponseType,
  PersonTypeType,
  deserializePersonType,
} from '../schemas/person-type.schema';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { defaultErrorResponseHandler } from '../helpers/response-format.helper';
import { PersonResponseType } from '@schemas/person.schema';
import { ErrorResponseType } from '@schemas/error.schema';

const apiUrl = 'http://localhost:3333';

@Injectable({
  providedIn: 'root',
})
export class PersonTypesService {
  private http: HttpClient = inject(HttpClient);

  getPersonTypes(): Observable<PersonResponseType[] | ErrorResponseType> {
    return this.http.get<PersonTypeResponseType>(`${apiUrl}/person_types`).pipe(
      map((response: PersonTypeResponseType) => ({
        // deserialize the data
        data: response.data.map((personType: PersonTypeType) =>
          deserializePersonType(personType),
        ),
        meta: response.meta,
      })),
      catchError(error => {
        return defaultErrorResponseHandler(error);
      }),
    );
  }
}
