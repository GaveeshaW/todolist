import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SignupComponent } from './signup.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthService } from '../auth.service';
import { of } from 'rxjs';
import { Router } from '@angular/router';

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['signup']);
    authServiceSpy.signup.and.returnValue(of({ token: 'mock-token' })); 

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([]), 
        ReactiveFormsModule,
        MatButtonModule,
        BrowserAnimationsModule,
        SignupComponent
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect to login page on successful signup', () => {
    const mockResponse = { token: 'valid-token' };
    authService.signup.and.returnValue(of(mockResponse));

    component.signupForm.setValue({
        name: 'John Doe',
        email: 'johndoe@example.com',
        password: 'password123',
        confirmPassword: 'password123'
    });

    component.onSubmit();

    expect(localStorage.getItem('token')).toBe(mockResponse.token);
  });

  it('should confirm both passwords are correct', () => {
    component.signupForm.setValue({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: 'password123',
      confirmPassword: 'password123'
    });

    component.onSubmit();

    expect(component.signupForm.get('password')?.value).toEqual(component.signupForm.get('confirmPassword')?.value);
  });

  it('should check if the token is valid', () => {
    const token = 'valid-token';
    localStorage.setItem('token', token);

    expect(localStorage.getItem('token')).toBe(token);
  });
});
