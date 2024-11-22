import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';
import { ErrorResponseType } from '@schemas/error.schema';
import { environment } from '../../../environments/environment';
import { FilterConfigModel } from '../models/filter-config.model';
import {
  FilterConfigResponseType,
  FilterConfigType,
} from '../schemas/filter-config.schema';

@Injectable({
  providedIn: 'root',
})
export class FilterConfigService {
  private http: HttpClient = inject(HttpClient);

  getFilterConfig(): Observable<FilterConfigModel[]> {
    return this.http
      .get<FilterConfigResponseType>(
        `${environment.apiUrl}/config/filter-configuration`,
      )
      .pipe(
        tap((response: FilterConfigResponseType | ErrorResponseType) => {
          // validate response is success
          if (response.errors && response.errors.length > 0) {
            throw new Error(response.message);
          }
        }),
        map(
          (response: FilterConfigResponseType) =>
            // deserialize the data
            response.data.map(
              (filterConfig: FilterConfigType) =>
                new FilterConfigModel(filterConfig),
            ) || [],
        ),
      );
  }
}
