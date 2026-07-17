import { Component, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
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

  private fb = inject(FormBuilder);
  private auth = inject(Auth);
  private router = inject(Router);

  hidePassword = true;
  loginForm;
  private isBrowser: boolean;

  constructor(
    private fb: FormBuilder,
    private authService: Auth,
    private router: Router,
    platformId: object = inject(PLATFORM_ID)
  ) {
    this.isBrowser = isPlatformBrowser(platformId);

    if (this.isBrowser) {
      localStorage.clear();
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

      next: (response: any) => {

        console.log(response);

        if (response.statusCode === 200) {
          if (this.isBrowser) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('role', JSON.stringify(response.data.role));
            // Store engineer username
            localStorage.setItem('username', response.data.username);
          }
          const role = response.data.role.name
          // Role based navigation

          if (role === 'engineer') {

            this.router.navigate([
              '/engineer'
            ]);

            if (response?.statusCode === 200 && response?.data?.token) {
              this.auth.saveSession(response.data);
              this.router.navigate(['/dashboard']);
            } else {
              this.errorMessage = 'Invalid credentials. Please try again.';
            }
          else if (role === 'admin') {

              this.router.navigate([
                '/dashboard'
              ]);

            }
            else if (role === 'user') {
              this.router.navigate([
                '/user'
              ]);
            }
          } else {

            alert('Invalid email or password');
          }
        });
      }
    }
