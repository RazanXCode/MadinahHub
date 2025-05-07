import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { switchMap, catchError, of } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Skip interceptor for login and register endpoints to avoid circular dependencies
  if (req.url.includes('/Auth/login') || req.url.includes('/Auth/register')) {
    return next(req);
  }

  // Get token from localStorage
  const token = localStorage.getItem('jwt_token');

  // If we have a token, add it to the request
  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  }

  // Otherwise, try to get a fresh token if user is logged in
  return authService.jwtToken$.pipe(
    switchMap(token => {
      if (token) {
        const authReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
        return next(authReq);
      }
      // No token available, proceed with original request
      return next(req);
    }),
    catchError(error => {
      console.error('Error in auth interceptor:', error);
      // Proceed with original request on error
      return next(req);
    })
  );
};