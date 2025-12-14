import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from './auth.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Login</h2>
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
      <button type="submit" [disabled]="form.invalid || pending">Login</button>
    </form>
    <div *ngIf="message">{{ message }}</div>
    <div *ngIf="token">Token: {{ token }}</div>
  `
})
export class LoginComponent {
  username = '';
  password = '';
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
        this.auth.login({ username: this.username, password: this.password })
      );
      this.token = token;
      this.message = 'Logged in.';
    } catch (err: any) {
      this.message = 'Login failed.';
    } finally {
      this.pending = false;
    }
  }
}
