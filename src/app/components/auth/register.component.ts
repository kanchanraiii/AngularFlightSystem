import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <nav class="navbar">
      <a routerLink="" class="logo">Flight Booking Sys</a>
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

    <main class="auth-shell login-shell register-shell">
      <div class="auth-card login-card">
        <div class="auth-header">
          <p class="eyebrow accent">Sign up</p>
          <h1>Create your account</h1>
          <p class="auth-subtitle spaced">Register to search and book flights faster.</p>
          <p *ngIf="auth.isAuthenticated()" class="auth-note">
            Already signed in. Logout to register a new user.
          </p>
        </div>

        <form
          *ngIf="!auth.isAuthenticated()"
          class="auth-form"
          (ngSubmit)="submit(form)"
          #form="ngForm"
          novalidate
        >
          <div class="input-group">
            <label>Username</label>
            <input type="text" name="username" placeholder="Enter username" [(ngModel)]="username" required />
          </div>

          <div class="input-group">
            <label>Full Name</label>
            <input type="text" name="fullName" placeholder="Enter your full name" [(ngModel)]="fullName" required />
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
            <input type="password" name="password" placeholder="Create a password" [(ngModel)]="password" required />
          </div>

          <div class="input-group">
            <label>Confirm Password</label>
            <input type="password" name="confirm" placeholder="Confirm your password" [(ngModel)]="confirmPassword" required />
          </div>

          <button type="submit" class="auth-btn login-btn" [class.submitting]="pending" [disabled]="pending">
            <span class="label">Create Account</span>
            <span class="spinner" aria-hidden="true"></span>
          </button>
        </form>

        <div class="auth-footer" *ngIf="!auth.isAuthenticated()">
          Already have an account? <a routerLink="/login">Login</a>
        </div>

      </div>

      <div class="hero-image login-hero">
        <div class="hero-overlay">
          <p class="eyebrow accent">Flight Booking</p>
          <h2>Join and start booking</h2>
          <p>Create your account to manage tickets and history.</p>
        </div>
      </div>
    </main>
  `
})
export class RegisterComponent {
  password = '';
  confirmPassword = '';
  fullName = '';
  email = '';
  username = '';
  role = 'ROLE_USER';
  pending = false;
  message = '';
  token: string | null = null;
  toastMessage = '';
  toastType: 'success' | 'error' | '' = '';
  toastVisible = false;
  private toastTimeout: any;

  constructor(public auth: AuthService, private router: Router, private cdr: ChangeDetectorRef) {}

  async submit(form: NgForm) {
    if (this.pending) return;
    if (form.invalid) {
      this.message = 'All fields are required.';
      form.control.markAllAsTouched();
      this.showToast('Please complete all fields with a valid email.', 'error');
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.message = 'Passwords do not match.';
      this.showToast('Passwords do not match.', 'error');
      return;
    }
    this.pending = true;
    this.message = '';
    this.token = null;

    try {
      const token = await firstValueFrom(
        this.auth.register({
          username: this.username,
          password: this.password,
          fullName: this.fullName,
          email: this.email,
          role: this.role
        })
      );
      this.token = token;
      console.log('Register success', { token, email: this.email, username: this.username });
      this.message = 'Registered. Redirecting...';
      this.showToast('Account created. Redirecting...', 'success');
      await this.router.navigate(['/']);
    } catch (err: any) {
      this.message = 'Registration failed.';
      this.showToast('Registration failed. Please try again.', 'error');
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
}
