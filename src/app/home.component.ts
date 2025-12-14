import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <nav class="navbar">
      <a routerLink="/" class="logo">Flight Booking Sys</a>
      <div class="nav-actions">
        <ng-container *ngIf="auth.isAuthenticated(); else guestActions">
          <button class="login" routerLink="/history">User History</button>
          <button class="signup" (click)="logout()">Logout</button>
        </ng-container>
        <ng-template #guestActions>
          <button class="login" routerLink="/login">Login</button>
          <button class="signup" routerLink="/register">Sign Up</button>
        </ng-template>
      </div>
    </nav>

    <main class="main">
      <div class="search-card">
        <h1 class="card-heading">Search Flights</h1>
        <div class="trip-type">
          <button [class.active]="tripType === 'one-way'" (click)="setTripType('one-way')">One Way</button>
          <button [class.active]="tripType === 'round-trip'" (click)="setTripType('round-trip')">Round Trip</button>
        </div>
        <div class="form-row">
          <div class="input-group">
            <label>From</label>
            <input type="text" placeholder="Departure city" [(ngModel)]="from" />
          </div>

          <div class="input-group">
            <label>To</label>
            <input type="text" placeholder="Destination city" [(ngModel)]="to" />
          </div>

          <div class="input-group">
            <label>Departure Date</label>
            <input type="date" [(ngModel)]="departureDate" />
          </div>

          <div class="input-group" *ngIf="tripType === 'round-trip'">
            <label>Return Date</label>
            <input type="date" [(ngModel)]="returnDate" />
          </div>
        </div>

        <button class="search-btn" (click)="search()">Search Flights</button>
      </div>
    </main>
  `
})
export class HomeComponent {
  tripType: 'one-way' | 'round-trip' = 'one-way';
  from = '';
  to = '';
  departureDate = '';
  returnDate = '';

  constructor(public auth: AuthService, private router: Router) {}

  setTripType(type: 'one-way' | 'round-trip') {
    this.tripType = type;
  }

  search() {
    console.log('Search flights', {
      tripType: this.tripType,
      from: this.from,
      to: this.to,
      departureDate: this.departureDate,
      returnDate: this.returnDate
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
