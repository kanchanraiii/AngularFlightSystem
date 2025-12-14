import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-protected',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Protected Area</h2>
    <p *ngIf="session()?.username">Signed in as: {{ session()?.username }}</p>
    <p *ngIf="!session()?.username">Signed in with token.</p>
    <p *ngIf="session()?.token">Token (truncated): {{ session()?.token | slice:0:24 }}...</p>
    <button (click)="logout()">Logout</button>
  `
})
export class ProtectedComponent {
  constructor(private auth: AuthService) {}

  get session() {
    return this.auth.session;
  }

  logout() {
    this.auth.logout();
  }
}
