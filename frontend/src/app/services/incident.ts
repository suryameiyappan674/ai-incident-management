import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Incident {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/v1/incidents';

  /** Fetch paginated incidents */
  getIncidents(page: number = 1, limit: number = 10): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?page=${page}&limit=${limit}`);
  }

  /** Fetch assignments for the logged-in engineer */
  getMyAssignments(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/my-assignments`);
  }

  /** Create a new incident */
  createIncident(data: { title: string; description: string; priority: string }): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }
  
    /** Update incident status */
  updateIncidentStatus(
    incidentId: string,
    status: string
  ): Observable<any> {

    return this.http.patch<any>(
      `${this.apiUrl}/${incidentId}/status`,
      {
        status
      }
    );

  }

  /** Analyze incident using AI service */
  analyzeIncident(title: string, description: string): Observable<any> {
    return this.http.post<any>('http://127.0.0.1:8000/api/v1/incidents/analyze', {
      title,
      description
    });
  }
}
