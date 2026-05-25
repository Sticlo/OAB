import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

/**
 * JWT Auth Interceptor
 * Agrega el token JWT en cada petición HTTP y maneja errores 401.
 */
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  const isBrowser = isPlatformBrowser(platformId);

  const token = isBrowser ? localStorage.getItem('token') : null;

  // Agregar Authorization header si existe token
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && isBrowser) {
        // Token expirado o inválido: limpiar sesión y redirigir
        localStorage.removeItem('token');
        localStorage.removeItem('current_user');
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
