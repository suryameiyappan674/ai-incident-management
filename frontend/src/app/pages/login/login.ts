import { Component, inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  platformId = inject(PLATFORM_ID);
  private fb = inject(FormBuilder);
  private auth = inject(Auth);
  private router = inject(Router);

  hidePassword = true;
  isLoading = false;
  errorMessage = '';

  constructor() {
    // If user is already logged in, redirect to their role's page
    if (isPlatformBrowser(this.platformId) && this.auth.isLoggedIn()) {
      const user = this.auth.getUser();
      const roleName = user?.role?.name;
      const roleRoutes: Record<string, string> = {
        admin: '/dashboard',
        engineer: '/engineer',
        user: '/user'
      };
      this.router.navigate([roleRoutes[roleName] ?? '/dashboard']);
    }
  }

  loginForm = this.fb.group({
    // Accepts email OR username — no strict email validator
    email: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });

  login() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.auth.login(this.loginForm.getRawValue() as { email: string; password: string })
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;

          if (response?.statusCode === 200 && response?.data?.token) {
            this.auth.saveSession(response.data);
            if (this.auth.isLoggedIn()) {
              const user = this.auth.getUser();
              const roleName = user?.role?.name;
              const roleRoutes: Record<string, string> = {
                admin: '/dashboard',
                engineer: '/engineer',
                user: '/user'
              };
              this.router.navigate([roleRoutes[roleName] ?? '/dashboard']);
            }
          } else {
            this.errorMessage = 'Invalid credentials. Please try again.';
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage =
            err?.error?.message ?? 'Invalid email or password.';
        }
      });
  }
}