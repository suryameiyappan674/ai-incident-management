import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class Auth {

  private http = inject(HttpClient);

  private apiUrl = 'http://10.68.10.106:3000/api/v1/users/login';


  login(data: any) {

    return this.http.post(
      this.apiUrl,
      data
    );

  }

}