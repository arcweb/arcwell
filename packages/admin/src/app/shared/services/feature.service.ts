import { Injectable, inject } from '@angular/core';
import { FeatureModel } from '../models/feature.model';
import { FeatureResponseType, FeatureType } from '../schemas/feature.schema';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';
import { ErrorResponseType } from '../schemas/error.schema';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FeatureService {
  private http: HttpClient = inject(HttpClient);

  getFeatures(): Observable<FeatureModel[]> {
    return this.http
      .get<FeatureResponseType>(`${environment.apiUrl}/config/features-menu`)
      .pipe(
        tap((response: FeatureResponseType | ErrorResponseType) => {
          // validate response is success
          if (response.errors && response.errors.length > 0) {
            throw new Error(response.message);
          }
        }),
        map(
          (response: FeatureResponseType) =>
            // deserialize the data
            response.data.map(
              (feature: FeatureType) => new FeatureModel(feature),
            ) || [],
        ),
      );
  }
}
