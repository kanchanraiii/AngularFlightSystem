import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from './auth/auth.service';
import { BookingService } from './booking.service';
import { firstValueFrom } from 'rxjs';

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
            <input type="text" placeholder="Departure city" [(ngModel)]="from" (input)="onSourceInput()" />
            <ul class="suggestions" *ngIf="sourceSuggestions.length">
              <li *ngFor="let s of sourceSuggestions" (click)="selectSource(s)">{{ s }}</li>
            </ul>
          </div>

          <div class="input-group">
            <label>To</label>
            <input type="text" placeholder="Destination city" [(ngModel)]="to" (input)="onDestInput()" />
            <ul class="suggestions" *ngIf="destSuggestions.length">
              <li *ngFor="let s of destSuggestions" (click)="selectDest(s)">{{ s }}</li>
            </ul>
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

        <div class="results" *ngIf="searchAttempted && !loading">
          <p *ngIf="!filteredFlights.length">No flights available.</p>
          <div class="history-list" *ngIf="filteredFlights.length">
            <div class="history-item" *ngFor="let f of filteredFlights">
              <div class="history-row">
                <span class="label">Flight</span>
                <span class="value">{{ f.flightNumber || f.airlineCode || 'Flight' }}</span>
              </div>
              <div class="history-row">
                <span class="label">Route</span>
                <span class="value">{{ f.sourceCity }} → {{ f.destinationCity }}</span>
              </div>
              <div class="history-row">
                <span class="label">Departure</span>
                <span class="value">{{ f.departureDate }} {{ f.departureTime }}</span>
              </div>
              <div class="history-row">
                <span class="label">Arrival</span>
                <span class="value">{{ f.arrivalDate }} {{ f.arrivalTime }}</span>
              </div>
              <div class="history-row">
                <span class="label">Price</span>
                <span class="value">{{ f.price || 'N/A' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  `
})
export class HomeComponent implements OnInit {
  tripType: 'one-way' | 'round-trip' = 'one-way';
  from = '';
  to = '';
  departureDate = '';
  returnDate = '';
  flights: any[] = [];
  filteredFlights: any[] = [];
  sourceSuggestions: string[] = [];
  destSuggestions: string[] = [];
  loading = false;
  searchAttempted = false;
  error = '';

  constructor(public auth: AuthService, private router: Router, private booking: BookingService) {}

  ngOnInit() {
    this.loadFlights();
  }

  async loadFlights() {
    this.loading = true;
    this.error = '';
    try {
      const flights = await firstValueFrom(this.booking.getAllFlights());
      this.flights = Array.isArray(flights) ? flights : [];
    } catch (err) {
      this.error = 'Failed to load flights.';
      this.flights = [];
    } finally {
      this.loading = false;
    }
  }

  setTripType(type: 'one-way' | 'round-trip') {
    this.tripType = type;
    this.filteredFlights = [];
    this.searchAttempted = false;
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  onSourceInput() {
    this.sourceSuggestions = this.buildSuggestions(this.from);
  }

  onDestInput() {
    this.destSuggestions = this.buildSuggestions(this.to);
  }

  buildSuggestions(query: string) {
    const q = (query || '').trim().toLowerCase();
    if (!q) return [];
    const cities = new Set<string>();
    this.flights.forEach((f) => {
      if (f.sourceCity && f.sourceCity.toLowerCase().includes(q)) cities.add(f.sourceCity);
      if (f.destinationCity && f.destinationCity.toLowerCase().includes(q)) cities.add(f.destinationCity);
    });
    return Array.from(cities).slice(0, 5);
  }

  selectSource(city: string) {
    this.from = city;
    this.sourceSuggestions = [];
  }

  selectDest(city: string) {
    this.to = city;
    this.destSuggestions = [];
  }

  search() {
    this.searchAttempted = true;
    this.sourceSuggestions = [];
    this.destSuggestions = [];
    if (!this.from || !this.to || !this.departureDate) {
      this.filteredFlights = [];
      return;
    }
    const fromLower = this.from.toLowerCase();
    const toLower = this.to.toLowerCase();
    this.filteredFlights = this.flights.filter((f) => {
      const src = (f.sourceCity || '').toLowerCase();
      const dst = (f.destinationCity || '').toLowerCase();
      const dateMatch = this.departureDate ? f.departureDate === this.departureDate : true;
      return src.includes(fromLower) && dst.includes(toLower) && dateMatch;
    });
  }
}
