import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take, catchError, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRole = route.data['role'] as string;

  // First check if we have a stored role in localStorage for faster access
  const storedRole = localStorage.getItem('userRole');
  if (storedRole) {
    // If the stored role doesn't match required role, redirect accordingly
    if (requiredRole && storedRole !== requiredRole) {
      if (storedRole === 'Admin') {
        router.navigate(['/admin']);
      } else {
        router.navigate(['/dashboard']);
      }
      return of(false);
    }
  }

  // If no stored role or we want to verify with backend, use userProfile$
  return authService.userProfile$.pipe(
    take(1),
    map(userProfile => {
      // Check if user is authenticated
      if (!userProfile) {
        // No profile, check for fallback in localStorage before redirecting
        if (!storedRole) {
          router.navigate(['/login']);
          return false;
        }
        return storedRole === requiredRole;
      }

      // Store the role for future checks
      localStorage.setItem('userRole', userProfile.role);

      // Check if user has the required role
      if (requiredRole && userProfile.role !== requiredRole) {
        // Redirect based on actual role
        if (userProfile.role === 'Admin') {
          router.navigate(['/admin']);
        } else {
          router.navigate(['/dashboard']);
        }
        return false;
      }

      return true;
    }),
    catchError(() => {
      // If there's an error, check localStorage fallback
      if (storedRole && storedRole === requiredRole) {
        return of(true);
      }
      router.navigate(['/login']);
      return of(false);
    })
  );
};