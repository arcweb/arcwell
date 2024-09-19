import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';

import { HealthCheck } from '@models/health-check';

@Injectable({
  providedIn: 'root'
})
export class HealthService {
  private healthUrl = 'http://localhost:3333/health';

  private headers = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  constructor(private http: HttpClient) {}

  checkHealth(): Observable<HealthCheck> {
    const { headers } = this;
    return this.http.get<HealthCheck>(this.healthUrl, { headers });
  }
}