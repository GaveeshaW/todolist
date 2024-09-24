import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthService } from '../auth.service';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']); 

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        ReactiveFormsModule,
        MatButtonModule,
        BrowserAnimationsModule,
        LoginComponent
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show error message for invalid login credentials', () => {
    const mockResponse = { token: null }; // Simulating invalid credentials
    authService.login.and.returnValue(of(mockResponse));

    component.loginForm.setValue({ email: 'test@example.com', password: 'password' });
    component.onSubmit();

    expect(component.errorMessage).toBe('Invalid login credentials.');
  });

  it('should show error message for incorrect email or password', () => {
    const mockError = { message: 'Login failed' };
    authService.login.and.returnValue(throwError(mockError)); // Simulating error response

    component.loginForm.setValue({ email: 'test@example.com', password: 'wrongpassword' });
    component.onSubmit();

    expect(component.errorMessage).toBe('Incorrect email or password.');
  });

  it('should not submit if the form is invalid', () => {
    spyOn(component, 'onSubmit').and.callThrough();
    component.loginForm.setValue({ email: '', password: '' }); // Invalid form

    component.onSubmit();

    expect(authService.login).not.toHaveBeenCalled(); // Should not call login
    expect(component.errorMessage).toBeNull(); // Ensure no error message set
  });
});
