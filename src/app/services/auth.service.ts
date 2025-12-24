import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';

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

type AuthResponse =
  | string
  | {
      token: string;
      createdAt?: string;
    };

type UserSession = {
  token: string;
  username: string | null;
  email: string | null;
  createdAt: string | null;
  mustChangePassword: boolean;
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
  private readonly createdAtKey = 'auth_created_at';
  private readonly maxPasswordAgeDays = 90;
  private readonly sessionState = signal<UserSession | null>(
    this.hydrateSession()
  );

  readonly session = this.sessionState.asReadonly();
  readonly isAuthenticated = computed(() => !!this.sessionState());
  readonly passwordChangeRequired = computed(
    () => this.sessionState()?.mustChangePassword ?? false
  );

  constructor(private http: HttpClient) {}

  
  login(payload: LoginRequest, emailForSession?: string) {
    return this.http
      .post<AuthResponse>(
        `${this.baseUrl}/login`,
        payload,
        { responseType: 'text' as 'json' }
      )
      .pipe(
        tap((res) =>
          this.persistSession(res, payload.username, emailForSession ?? null)
        ),
        map((res) => this.normalizeAuthResponse(res).token)
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
        tap((res) =>
          this.persistSession(res, payload.username, payload.email)
        ),
        map((res) => this.normalizeAuthResponse(res).token)
      );
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.usernameKey);
    localStorage.removeItem(this.emailKey);
    localStorage.removeItem(this.roleKey);
    localStorage.removeItem(this.createdAtKey);
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

  requiresPasswordChange(): boolean {
    return this.sessionState()?.mustChangePassword ?? false;
  }

  markPasswordChanged() {
    const existing = this.sessionState();
    if (!existing) return;

    const refreshedCreatedAt = new Date().toISOString();
    localStorage.setItem(this.createdAtKey, refreshedCreatedAt);

    this.sessionState.set({
      ...existing,
      createdAt: refreshedCreatedAt,
      mustChangePassword: false
    });
  }

  
  private persistSession(
    authResponse: AuthResponse,
    username: string | null,
    email: string | null
  ) {
    const { token, createdAt } = this.normalizeAuthResponse(authResponse);
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

    if (createdAt) {
      localStorage.setItem(this.createdAtKey, createdAt);
    }

    const creationDate = createdAt ?? localStorage.getItem(this.createdAtKey);
    const mustChangePassword = this.isPasswordExpired(creationDate);

    this.sessionState.set({
      token,
      username,
      email: email ?? localStorage.getItem(this.emailKey),
      createdAt: creationDate ?? null,
      mustChangePassword
    });
  }

  private hydrateSession(): UserSession | null {
    const token = localStorage.getItem(this.tokenKey);
    if (!token) {
      return null;
    }

    const username = localStorage.getItem(this.usernameKey);
    const email = localStorage.getItem(this.emailKey);
    const createdAt = localStorage.getItem(this.createdAtKey);
    const mustChangePassword = this.isPasswordExpired(createdAt);

    return {
      token,
      username,
      email,
      createdAt,
      mustChangePassword
    };
  }

  private extractRoleFromToken(token: string): string | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role ?? null;
    } catch {
      return null;
    }
  }

  private normalizeAuthResponse(response: AuthResponse): { token: string; createdAt: string | null } {
    if (typeof response === 'string') {
      const parsed = this.tryParseJson(response);
      if (parsed && typeof parsed === 'object' && 'token' in parsed) {
        const obj = parsed as { token: string; createdAt?: string };
        return { token: obj.token, createdAt: obj.createdAt ?? null };
      }
      return { token: response, createdAt: null };
    }

    return { token: response.token, createdAt: response.createdAt ?? null };
  }

  private tryParseJson(value: string): unknown {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }

  private isPasswordExpired(createdAt: string | null | undefined): boolean {
    if (!createdAt) return false;
    const createdDate = new Date(createdAt);
    if (isNaN(createdDate.getTime())) return false;

    const ageMs = Date.now() - createdDate.getTime();
    const maxAgeMs = this.maxPasswordAgeDays * 24 * 60 * 60 * 1000;
    return ageMs >= maxAgeMs;
  }
}
