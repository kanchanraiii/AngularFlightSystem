import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from './auth.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Register</h2>
    <form (ngSubmit)="submit()" #form="ngForm">
      <label>
        Username:
        <input name="username" [(ngModel)]="username" required />
      </label>
      <br />
      <label>
        Password:
        <input name="password" type="password" [(ngModel)]="password" required />
      </label>
      <br />
      <label>
        Full name:
        <input name="fullName" [(ngModel)]="fullName" required />
      </label>
      <br />
      <label>
        Email:
        <input name="email" type="email" [(ngModel)]="email" required />
      </label>
      <br />
      <label>
        Role:
        <input name="role" [(ngModel)]="role" required />
      </label>
      <br />
      <button type="submit" [disabled]="form.invalid || pending">Register</button>
    </form>
    <div *ngIf="message">{{ message }}</div>
    <div *ngIf="token">Token: {{ token }}</div>
  `
})
export class RegisterComponent {
  username = '';
  password = '';
  fullName = '';
  email = '';
  role = 'ROLE_USER';
  pending = false;
  message = '';
  token: string | null = null;

  constructor(private auth: AuthService) {}

  async submit() {
    if (this.pending) return;
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
      this.message = 'Registered.';
    } catch (err: any) {
      this.message = 'Registration failed.';
    } finally {
      this.pending = false;
    }
  }
}
