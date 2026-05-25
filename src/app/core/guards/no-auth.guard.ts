import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

/**
 * NoAuthGuard
 * Redirige a usuarios ya autenticados fuera de las páginas de login/register.
 * Si ya tienen sesión activa, los manda al panel que corresponda según su rol.
 */
export const noAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    if (authService.hasRole(UserRole.ADMIN)) {
      router.navigate(['/admin']);
    } else {
      router.navigate(['/productos']);
    }
    return false;
  }

  return true;
};
