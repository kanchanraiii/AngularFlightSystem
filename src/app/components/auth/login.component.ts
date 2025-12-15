import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

    <div class="toast" *ngIf="toastMessage" [class.success]="toastType === 'success'" [class.error]="toastType === 'error'">
      {{ toastMessage }}
    </div>

    <main class="main">
      <div class="auth-card">
        <h1 class="card-heading">Welcome Back</h1>
        <p class="auth-subtitle">Login to your account</p>

        <p *ngIf="auth.isAuthenticated()">You are already logged in. Go to <a routerLink="/protected">Protected</a>.</p>

        <form *ngIf="!auth.isAuthenticated()" class="auth-form" (ngSubmit)="submit()" #form="ngForm">
          <div class="input-group">
            <label>Username</label>
            <input type="text" name="username" placeholder="Enter your username" [(ngModel)]="username" required />
          </div>

          <div class="input-group">
            <label>Email</label>
            <input type="email" name="email" placeholder="Enter your email" [(ngModel)]="email" required />
          </div>

          <div class="input-group">
            <label>Password</label>
            <input name="password" type="password" placeholder="Enter your password" [(ngModel)]="password" required />
          </div>

          <div class="form-options"></div>

          <button type="submit" class="auth-btn" [disabled]="form.invalid || pending">Login</button>
        </form>

        <div class="auth-footer" *ngIf="!auth.isAuthenticated()">
          Don't have an account? <a routerLink="/register">Sign Up</a>
        </div>

        <div *ngIf="message">{{ message }}</div>
        <div *ngIf="token && !auth.isAuthenticated()">Token: {{ token }}</div>
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

  constructor(public auth: AuthService, private router: Router, private cdr: ChangeDetectorRef) {}

  async submit() {
    if (this.pending) return;
    if (!this.username || !this.email || !this.password) {
      this.message = 'Username, email, and password are required.';
      this.showToast(this.message, 'error');
      return;
    }
    this.pending = true;
    this.message = '';
    this.token = null;
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
    this.cdr.detectChanges();
    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.toastMessage = '';
      this.toastType = '';
      this.cdr.detectChanges();
    }, 3000);
  }
}
