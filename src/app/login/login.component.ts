import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    RouterModule,
    ReactiveFormsModule,
    CommonModule,
    FormsModule
  ]
})
export class LoginComponent {
  credentials = { email: '', password: '' };
  loginForm: FormGroup;
  errorMessage: string | null = null;

  constructor(private authService: AuthService, private router: Router, private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit() {
    this.errorMessage = null;
    if (this.loginForm.invalid) {
      return;
    }
    const credentials = this.loginForm.value;

    this.authService.login(credentials).subscribe(
      response => {
        if (response.token) {
          localStorage.setItem('token', response.token);
          this.router.navigate(['main']);
        } else {
          this.errorMessage = 'Invalid login credentials.';
          console.log('Invalid login credentials')
        }
      },
      error => {
        this.errorMessage = 'Incorrect email or password.';
        console.error(error);
      }
    );
  }
}
