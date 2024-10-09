import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Fact } from '@models/fact';
import { environment } from 'src/environments/environment';

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
  private apiUrl = environment.apiUrl + '/data';

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
