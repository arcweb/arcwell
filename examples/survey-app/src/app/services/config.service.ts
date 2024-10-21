import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';

export interface InstallResponse {
  data: {
    counts: {
      fact_types: number;
      people: number;
      person_types: number;
      resource_types: number;
      event_types: number;
      tags: number;
      roles: number;
      users: number;
    };
    createdObjects?: {
      fact_types: any[];
      people: any[];
      person_types: any[];
      resource_types: any[];
      event_types: any[];
      tags: any[];
      roles: any[];
      users: any[];
    };
  };
}

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private http: HttpClient = inject(HttpClient);

  installConfig(payload: any, returnObjects: boolean = false): Observable<InstallResponse> {
    let params = new HttpParams().set('returnObjects', returnObjects.toString());
    return this.http.post<InstallResponse>(`${environment.apiUrl}/config/install`, payload, { params });
  }
}