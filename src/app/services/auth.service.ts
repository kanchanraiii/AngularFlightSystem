import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

type LoginRequest = {
  username: string;
  password: string;
};

type RegisterRequest = {
  username: string;
  password: string;
  fullName: string;
  email: string;
  role: string;
};

type AuthResponse = string; // backend returns raw token string

type UserSession = {
  token: string;
  username: string | null;
  email: string | null;
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly apiBase =
    window.location.port === '9000' ? '' : 'http://localhost:9000';

  private readonly baseUrl = `${this.apiBase}/auth`;

  private readonly tokenKey = 'auth_token';
  private readonly usernameKey = 'auth_username';
  private readonly emailKey = 'auth_email';
  private readonly roleKey = 'auth_role'; 
  private readonly sessionState = signal<UserSession | null>(
    this.hydrateSession()
  );

  readonly session = this.sessionState.asReadonly();
  readonly isAuthenticated = computed(() => !!this.sessionState());

  constructor(private http: HttpClient) {}

  
  login(payload: LoginRequest, emailForSession?: string) {
    return this.http
      .post<AuthResponse>(
        `${this.baseUrl}/login`,
        payload,
        { responseType: 'text' as 'json' }
      )
      .pipe(
        tap((token) =>
          this.persistSession(token, payload.username, emailForSession ?? null)
        )
      );
  }

  
  register(payload: RegisterRequest) {
    return this.http
      .post<AuthResponse>(
        `${this.baseUrl}/register`,
        payload,
        { responseType: 'text' as 'json' }
      )
      .pipe(
        tap((token) =>
          this.persistSession(token, payload.username, payload.email)
        )
      );
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.usernameKey);
    localStorage.removeItem(this.emailKey);
    localStorage.removeItem(this.roleKey);
    this.sessionState.set(null);
  }

  getToken(): string | null {
    return this.sessionState()?.token ?? null;
  }

  getUsername(): string | null {
    return this.sessionState()?.username ?? null;
  }

  getEmail(): string | null {
    return this.sessionState()?.email ?? null;
  }

  getRole(): string | null {
    return localStorage.getItem(this.roleKey);
  }

  isAdmin(): boolean {
    return this.getRole() === 'ROLE_ADMIN';
  }

  
  private persistSession(
    token: string,
    username: string | null,
    email: string | null
  ) {
    localStorage.setItem(this.tokenKey, token);

    const role = this.extractRoleFromToken(token);
    if (role) {
      localStorage.setItem(this.roleKey, role);
    }

    if (username) {
      localStorage.setItem(this.usernameKey, username);
    }

    if (email) {
      localStorage.setItem(this.emailKey, email);
    }

    this.sessionState.set({
      token,
      username,
      email: email ?? localStorage.getItem(this.emailKey)
    });
  }

  private hydrateSession(): UserSession | null {
    const token = localStorage.getItem(this.tokenKey);
    if (!token) {
      return null;
    }

    const username = localStorage.getItem(this.usernameKey);
    const email = localStorage.getItem(this.emailKey);

    return { token, username, email };
  }

  private extractRoleFromToken(token: string): string | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role ?? null;
    } catch {
      return null;
    }
  }
}
