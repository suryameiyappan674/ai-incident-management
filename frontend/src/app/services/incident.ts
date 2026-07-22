import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Incident {
  private http = inject(HttpClient);
  // private apiUrl = 'http://localhost:3000/api/v1/incidents';
  private apiUrl = 'http://10.68.10.106:3000/api/v1/incidents';


  /** Fetch paginated incidents */
  getIncidents(page: number = 1, limit: number = 10): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?page=${page}&limit=${limit}`);
  }

  /** Create a new incident */
  createIncident(data: { title: string; description: string; priority: string }): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }
}
