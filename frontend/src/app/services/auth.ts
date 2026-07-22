import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class Auth {

  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  // private apiUrl = 'http://10.68.10.106:3000/api/v1/users/login';


  // login(data: any) {

  //   return this.http.post(
  //     this.apiUrl,
  //     data
  //   );

  // }

  // private baseUrl = 'http://localhost:3000/api/v1/users';
  private baseUrl = 'http://10.68.10.106:3000/api/v1/users';


  /** POST /api/v1/users/login */
  login(data: { email: string; password: string }) {
    return this.http.post(`${this.baseUrl}/login`, data);
  }

  /** Save token + user data returned by the API */
  saveSession(data: any) {
    if (isPlatformBrowser(this.platformId)) {
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
  checkToken(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      if (localStorage.getItem('token')) {
        return true;
      }
      return false;
    }
    return false;
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token');
    }
    return null;
  }

  /** True if a token exists in storage */
  isLoggedIn(): boolean {
    return this.checkToken();
  }

  /** Clear session and navigate to login */
  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    this.router.navigate(['/login']);
  }

  /** Return the stored user object */
  getUser(): any {
    if (isPlatformBrowser(this.platformId)) {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    }
    return null;
  }
}