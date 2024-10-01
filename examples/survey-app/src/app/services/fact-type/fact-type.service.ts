import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';


export interface DimensionSchema {
  id: string;
  key: string;
  name: string;
  dataUnit: string;
  dataType: string;
  isRequired: boolean;
}

export interface FactType {
  id: string;
  key: string;
  name: string;
  description?: string;
  tags: string[];
  dimensionSchemas: DimensionSchema[];
}

@Injectable({
  providedIn: 'root',
})
export class FactTypeService {
  private apiUrl = 'http://localhost:3333';

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
      `${this.apiUrl}/facts/types`,
      { params }
    );
  }

  getFactTypeById(id: string): Observable<FactType> {
    return this.http.get<FactType>(`${this.apiUrl}/facts/types/${id}`);
  }
}
