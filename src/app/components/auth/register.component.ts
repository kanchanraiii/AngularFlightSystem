import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

    <main class="main">
      <div class="auth-card">
        <h1 class="card-heading">Create Account</h1>
        <p class="auth-subtitle">Sign up to get started</p>

        <p *ngIf="auth.isAuthenticated()">Already signed in. Logout to register a new user.</p>

        <form *ngIf="!auth.isAuthenticated()" class="auth-form" (ngSubmit)="submit()" #form="ngForm">
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
            <input type="email" name="email" placeholder="Enter your email" [(ngModel)]="email" required />
          </div>

          <div class="input-group">
            <label>Password</label>
            <input type="password" name="password" placeholder="Create a password" [(ngModel)]="password" required />
          </div>

          <div class="input-group">
            <label>Confirm Password</label>
            <input type="password" name="confirm" placeholder="Confirm your password" [(ngModel)]="confirmPassword" required />
          </div>

      <button type="submit" class="auth-btn" [disabled]="form.invalid || pending">Create Account</button>
    </form>

        <div class="auth-footer" *ngIf="!auth.isAuthenticated()">
          Already have an account? <a routerLink="/login">Login</a>
        </div>

        <div *ngIf="message">{{ message }}</div>
        <div *ngIf="token && !auth.isAuthenticated()">Token: {{ token }}</div>
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

  constructor(public auth: AuthService, private router: Router) {}

  async submit() {
    if (this.pending) return;
    if (!this.fullName || !this.email || !this.password || !this.confirmPassword) {
      this.message = 'All fields are required.';
      return;
    }
    this.pending = true;
    this.message = '';
    this.token = null;
    if (this.password !== this.confirmPassword) {
      this.message = 'Passwords do not match.';
      this.pending = false;
      return;
    }

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
      await this.router.navigate(['/']);
    } catch (err: any) {
      this.message = 'Registration failed.';
    } finally {
      this.pending = false;
    }
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
