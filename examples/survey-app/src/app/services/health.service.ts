import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';

import { HealthCheck } from '@models/health-check';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HealthService {
  private healthUrl = environment.apiUrl + '/health';

  private headers = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  constructor(private http: HttpClient) { }

  checkHealth(): Observable<HealthCheck> {
    const { headers } = this;
    return this.http.get<HealthCheck>(this.healthUrl, { headers });
  }
}