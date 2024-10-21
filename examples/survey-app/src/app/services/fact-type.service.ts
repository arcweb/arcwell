import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FactType } from '@models/fact-type';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FactTypeService {
  private apiUrl = environment.apiUrl + '/facts/types';

  constructor(private http: HttpClient) { }

  getFactTypes(queryData?: any): Observable<{ data: FactType[], meta: { count: number } }> {
    let params = new HttpParams();

    if (queryData) {
      if (queryData.limit) params = params.append('limit', queryData.limit);
      if (queryData.offset) params = params.append('offset', queryData.offset);
      if (queryData.search) params = params.append('search', queryData.search);
      if (queryData.sort) params = params.append('sort', queryData.sort);
      if (queryData.order) params = params.append('order', queryData.order);
    }

    return this.http.get<{ data: FactType[], meta: { count: number } }>(
      `${this.apiUrl}`,
      { params }
    );
  }

  getFactTypeById(id: string): Observable<FactType> {
    return this.http.get<FactType>(`${this.apiUrl}/${id}`);
  }
}
