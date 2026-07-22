import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Engineer } from '../models/engineer';

@Injectable({
    providedIn: 'root'
})
export class User {

    private http = inject(HttpClient);

    // private baseUrl = 'http://localhost:3000/api/v1/users';
    private baseUrl = 'http://10.68.10.106:3000/api/v1/users';

    constructor() { }

    /**
     * Fetch all engineers
     */
    getEngineers() {
        return this.http.get<{ statusCode: number; data: Engineer[] }>(`${this.baseUrl}/engineers`);

    }

}