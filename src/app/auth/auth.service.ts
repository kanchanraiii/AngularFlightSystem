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
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly baseUrl = '/auth';
  private readonly tokenKey = 'auth_token';
  private readonly usernameKey = 'auth_username';
  private readonly sessionState = signal<UserSession | null>(this.hydrateSession());
  readonly session = this.sessionState.asReadonly();
  readonly isAuthenticated = computed(() => !!this.sessionState());

  constructor(private http: HttpClient) {}

  login(payload: LoginRequest) {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/login`, payload, { responseType: 'text' as 'json' })
      .pipe(tap((token) => this.persistSession(token, payload.username)));
  }

  register(payload: RegisterRequest) {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/register`, payload, { responseType: 'text' as 'json' })
      .pipe(tap((token) => this.persistSession(token, payload.username)));
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.usernameKey);
    this.sessionState.set(null);
  }

  getToken(): string | null {
    return this.sessionState()?.token ?? null;
  }

  getUsername(): string | null {
    return this.sessionState()?.username ?? null;
  }

  private persistSession(token: string, username: string | null) {
    localStorage.setItem(this.tokenKey, token);
    if (username) {
      localStorage.setItem(this.usernameKey, username);
    }
    this.sessionState.set({ token, username });
  }

  private hydrateSession(): UserSession | null {
    const token = localStorage.getItem(this.tokenKey);
    if (!token) {
      return null;
    }
    const username = localStorage.getItem(this.usernameKey);
    return { token, username };
  }
}
