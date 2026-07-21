import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class Assignment {

    private http = inject(HttpClient);

    private baseUrl = 'http://localhost:3000/api/v1/incidents';

    constructor() { }

    /**
     * Assign engineer to incident
     */
    assignEngineer(
        incidentId: string,
        assigneeId: string,
    ) {

        return this.http.post(

            `${this.baseUrl}/${incidentId}/assignments`,

            {
                assigneeId,
            }

        );

    }

    /**
     * Fetch assignment history
     */
    getAssignments(
        incidentId: string
    ) {

        return this.http.get(

            `${this.baseUrl}/${incidentId}/assignments`

        );

    }

}