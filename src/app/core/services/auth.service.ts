import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { User, UserRole } from '../models/user.model';
import { environment } from '@environments/environment';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  user: any;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'token';
  private readonly USER_KEY = 'current_user';
  private readonly url = `${environment.apiUrl}/auth`;

  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private get isBrowser(): boolean { return isPlatformBrowser(this.platformId); }

  private currentUser = signal<User | null>(this.loadUserFromStorage());

  readonly user = this.currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly isAdmin = computed(() => this.currentUser()?.role === UserRole.ADMIN);
  readonly isUser = computed(() => this.currentUser()?.role === UserRole.USER);

  /** Mapea la respuesta del backend al tipo User del frontend. */
  private mapUser(raw: any): User {
    return {
      id: raw._id || raw.id,
      email: raw.email,
      name: raw.name,
      role: raw.role as UserRole,
      createdAt: new Date(raw.createdAt),
      updatedAt: new Date(raw.updatedAt)
    };
  }

  /** Restaura el usuario desde localStorage al iniciar la app. */
  private loadUserFromStorage(): User | null {
    if (!this.isBrowser) return null;
    try {
      const raw = localStorage.getItem(this.USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  /** POST /api/auth/login */
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.url}/login`, credentials).pipe(
      tap(response => {
        const user = this.mapUser(response.user);
        this.currentUser.set(user);
        if (this.isBrowser) {
          localStorage.setItem(this.TOKEN_KEY, response.token);
          localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        }
        if (user.role === UserRole.ADMIN) {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/productos']);
        }
      })
    );
  }

  /** POST /api/auth/register */
  register(data: RegisterData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.url}/register`, data).pipe(
      tap(response => {
        const user = this.mapUser(response.user);
        this.currentUser.set(user);
        if (this.isBrowser) {
          localStorage.setItem(this.TOKEN_KEY, response.token);
          localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        }
        this.router.navigate(['/productos']);
      })
    );
  }

  /** Cierra sesión y limpia el estado. */
  logout(): void {
    this.currentUser.set(null);
    if (this.isBrowser) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
    this.router.navigate(['/home']);
  }

  hasRole(role: UserRole): boolean {
    return this.currentUser()?.role === role;
  }

  getCurrentUser(): User | null {
    return this.currentUser();
  }

  getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }
}
