import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface Fact {
  id?: string;
  typeKey: string;
  personId?: string;
  resourceId?: string;
  eventId?: string;
  // createdAt?: string;
  // updatedAt?: string;
  observed_at: string;
  info?: object;
  dimensions: Dimension[];
}

export interface Dimension {
  id?: string;
  key: string;
  value: any;
  factId?: string;
}

interface Filter {
  key: string;
  operator?: 'eq' | 'gt' | 'gt3' | 'lt' | 'lte' | 'ne',
  value: any;
}

interface QueryData {
  filters?: Filter[];
}

@Injectable({
  providedIn: 'root'
})
export class FactService {
  private apiUrl = 'http://localhost:3333/data';

  constructor(private http: HttpClient) { }

  queryFacts(queryData?: QueryData) {
    let filterString = '';

    if (queryData?.filters) {
      filterString += '?';

      queryData.filters.forEach((filter, index) => {
        filterString += `${index === 0 ? '' : '&'}filter[${filter.key}]${filter.operator ? `[${filter.operator} ]` : ''}=${filter.value}`;
      });
    }

    return this.http.get<any>(
      `${this.apiUrl}/query${filterString}`
    );
  }

  saveFact(fact: Fact) {
    return this.http.post<Fact>(`${this.apiUrl}/insert`, fact);
  }
}
