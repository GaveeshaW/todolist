import { TestBed } from '@angular/core/testing';
import { HttpInterceptorFn } from '@angular/common/http';

import { jwtInterceptor } from './jwt.interceptor';

describe('JwtInterceptor', () => {
  let interceptor: jwtInterceptor;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    interceptor = new jwtInterceptor(); 
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });
});
