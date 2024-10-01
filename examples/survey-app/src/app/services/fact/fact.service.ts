import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface Fact {
  id?: string;
  typeKey: string;
  personId?: string;
  resourceId?: string;
  eventId?: string;
  createdAt?: string;
  updatedAt?: string;
  observedAt?: string;
  info?: object;
  dimensions: Dimension[];
}

export interface Dimension {
  id?: string;
  key: string;
  value: string;
  factId: string;
}

@Injectable({
  providedIn: 'root'
})
export class FactService {
  private apiUrl = 'http://localhost:3333/data';

  constructor(private http: HttpClient) { }

  saveFact(fact: Fact) {
    return this.http.post<Fact>(`${this.apiUrl}/insert`, fact);
  }
}
