import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class Auth {

  private http = inject(HttpClient);
  private router = inject(Router);

  // private apiUrl = 'http://10.68.10.106:3000/api/v1/users/login';


  // login(data: any) {

  //   return this.http.post(
  //     this.apiUrl,
  //     data
  //   );

  // }

  private baseUrl = 'http://localhost:3000/api/v1/users';

  /** POST /api/v1/users/login */
  login(data: { email: string; password: string }) {
    return this.http.post(`${this.baseUrl}/login`, data);
  }

  /** Save token + user data returned by the API */
  saveSession(data: any) {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        _id: data._id,
        username: data.username,
        email: data.email,
        role: data.role
      }));
    }
  }

  /** Return the stored JWT token */
  getToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('token');
    }
    return null;
  }

  /** True if a token exists in storage */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  /** Clear session and navigate to login */
  logout() {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    this.router.navigate(['/login']);
  }

  /** Return the stored user object */
  getUser(): any {
    if (typeof window !== 'undefined' && window.localStorage) {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    }
    return null;
  }
}