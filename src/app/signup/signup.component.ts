//import necessary modules
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { FormsModule, ReactiveFormsModule, Validators, FormBuilder, FormGroup } from '@angular/forms';
import { PasswordErrorStateMatcher } from './PasswordErrorStateMatcher';
import { CommonModule } from '@angular/common';

//the component with the selector, template, css and the imports
@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  standalone: true,
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule
  ]
})

//the SignupComponent
export class SignupComponent {
  signupForm: FormGroup; 
  passwordErrorStateMatcher = new PasswordErrorStateMatcher(); //creates an instance of the passwordErrorStateMatcher

  constructor(private authService: AuthService, private router: Router, private fb: FormBuilder) { //the constructor with auth, router for routing the paths and form builder for the form
    this.signupForm = this.fb.group({ 
      name: ['', [Validators.required]], //validators are required to validate the name, email, password and confirmPassword
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator }); //to check if the password matches with the confirmPassword
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('password')!.value === form.get('confirmPassword')!.value ? null : { mismatch: true }; //gets the password from the form and checks if it matches with the confirmPassword value entered into the form
  }

  onSubmit() {

    const user = { //the user constant is defined here to get the values of the name, email etc
      name: this.signupForm.value.name,  
      email: this.signupForm.value.email, 
      password: this.signupForm.value.password, 
      confirmPassword: this.signupForm.value.confirmPassword 
    };

    console.log('Submitting: ', user); //prints the things taken from the user constant in the console logs
    this.authService.signup(user).subscribe(response => { //checks if the token is found in the response, if so set it to localstorage and redirect to login page
      if (response.token) { 
        localStorage.setItem('token', response.token); 
        localStorage.setItem('userName', user.name);
        localStorage.setItem('userEmail', user.email);
        this.router.navigate(['login']); 
      } else { //if not print in the console logs that the token isnt found
        console.error('Token not found in response'); 
      }
    }, error => { 
      console.error('Sign up error', error); //if there is somesort of a sign up error, it is displayed in the console logs alogn with the rror
      if (error.status === 400) { 
        alert('Bad request: Please check the form data and try again'); 
      }
    });
  }
}
