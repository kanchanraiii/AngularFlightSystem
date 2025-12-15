import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { firstValueFrom } from 'rxjs';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <nav class="navbar">
      <a routerLink="/" class="logo">Flight Booking Sys</a>
      <div class="nav-actions">
        <button class="signup" *ngIf="auth.isAuthenticated()" (click)="logout()">Logout</button>
        <ng-container *ngIf="!auth.isAuthenticated()">
          <button class="login" routerLink="/login">Login</button>
          <button class="signup" routerLink="/register">Sign Up</button>
        </ng-container>
      </div>
    </nav>

    <div
      class="toast"
      *ngIf="toastMessage"
      [class.success]="toastType === 'success'"
      [class.error]="toastType === 'error'"
      [class.hide]="!toastVisible"
    >
      {{ toastMessage }}
    </div>

    <main class="auth-shell login-shell">
      <div class="hero-image login-hero">
        <div class="hero-overlay">
          <p class="eyebrow accent">Flight Booking</p>
          <h2>Plan your next journey</h2>
          <p>Search, book, and manage your tickets with a quick sign-in.</p>
        </div>
      </div>

      <div class="auth-card login-card">
        <div class="auth-header">
          <p class="eyebrow accent">Sign in</p>
          <h1>Welcome back</h1>
          <p class="auth-subtitle spaced">Access your bookings and search flights faster.</p>
          <p *ngIf="auth.isAuthenticated()" class="auth-note">
            You are already logged in. Head to <a routerLink="/">home</a> or <a routerLink="/history">history</a>.
          </p>
        </div>

        <form *ngIf="!auth.isAuthenticated()" class="auth-form" (ngSubmit)="submit(form)" #form="ngForm" novalidate>
          <div class="input-group">
            <label>Username</label>
            <input type="text" name="username" placeholder="Enter your username" [(ngModel)]="username" required />
          </div>

          <div class="input-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              [(ngModel)]="email"
              required
              email
            />
          </div>

          <div class="input-group">
            <label>Password</label>
            <input name="password" type="password" placeholder="Enter your password" [(ngModel)]="password" required />
          </div>

          <button type="submit" class="auth-btn login-btn" [class.submitting]="pending" [disabled]="pending">
            <span class="label">Login</span>
            <span class="spinner" aria-hidden="true"></span>
          </button>
        </form>

        <div class="auth-footer" *ngIf="!auth.isAuthenticated()">
          Don't have an account? <a routerLink="/register">Sign Up</a>
        </div>

      </div>
    </main>
  `
})
export class LoginComponent {
  email = '';
  username = '';
  password = '';
  pending = false;
  message = '';
  token: string | null = null;
  toastMessage = '';
  toastType: 'success' | 'error' | '' = '';
  private toastTimeout: any;
  toastVisible = false;
  private readonly animationHoldMs = 1100;

  constructor(public auth: AuthService, private router: Router, private cdr: ChangeDetectorRef) {}

  async submit(form: NgForm) {
    if (this.pending) return;
    if (form.invalid) {
      this.message = 'Please enter username, valid email, and password.';
      form.control.markAllAsTouched();
      this.showToast(this.message, 'error');
      return;
    }
    this.pending = true;
    this.message = '';
    this.token = null;
    this.cdr.detectChanges();
    await this.sleep(this.animationHoldMs);
    try {
      const token = await firstValueFrom(
        this.auth.login({ username: this.username, password: this.password }, this.email)
      );
      this.token = token;
      console.log('Login success', { token, email: this.email, username: this.username });
      this.message = 'Logged in. Redirecting...';
      this.showToast('Logged in successfully', 'success');
      this.cdr.detectChanges();
      await this.router.navigate(['/']);
    } catch (err: any) {
      this.message = 'Login failed.';
      this.showToast('Login failed. Check your credentials.', 'error');
    } finally {
      this.pending = false;
      this.cdr.detectChanges();
    }
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  private showToast(message: string, type: 'success' | 'error') {
    this.toastMessage = message;
    this.toastType = type;
    this.toastVisible = true;
    this.cdr.detectChanges();
    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.toastVisible = false;
      this.cdr.detectChanges();
      setTimeout(() => {
        this.toastMessage = '';
        this.toastType = '';
        this.cdr.detectChanges();
      }, 250);
    }, 3000);
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
