import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Auth } from '../../services/auth';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  hidePassword = true;
  loginForm;
  constructor(
    private fb: FormBuilder,
    private authService: Auth,
    private router: Router
  ) {

    this.loginForm = this.fb.group({

      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],

      password: [
        '',
        Validators.required
      ]

    });

  }

  login() {

    if (this.loginForm.invalid) {
      return;
    }

    this.authService.login(this.loginForm.getRawValue()).subscribe({

      next: (response: any) => {

        console.log(response);

        if (response.statusCode === 200) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('role', JSON.stringify(response.data.role));
      // Store engineer username
      localStorage.setItem(  'username',response.data.username);
          const role =response.data.role.name
    // Role based navigation

          if(role === 'engineer'){

            this.router.navigate([
              '/engineer'
            ]);

          }
          else if(role === 'admin'){

            this.router.navigate([
              '/dashboard'
            ]);

          }
          else if(role === 'user'){
             this.router.navigate([
              '/user'
            ]);
          }
        }else{

            alert('Invalid email or password');
        }

      },
      error: (error) => {

        console.error(error);

        alert('Invalid email or password');

      }

    });
  }

}
