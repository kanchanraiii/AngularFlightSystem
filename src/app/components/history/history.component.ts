import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { BookingRecord, BookingService } from '../../services/booking.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, RouterLink],
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

    <main class="main">
      <div class="search-card" style="max-width: 600px; width: 100%;">
        <h1 class="card-heading">User History</h1>
        <p *ngIf="!auth.isAuthenticated()">Please log in to view your history.</p>
        <div *ngIf="auth.isAuthenticated()">
          <p *ngIf="!email">No email found for this session. Please log in again.</p>
          <div *ngIf="pending && !records.length">Loading...</div>
          <div *ngIf="error" style="color: red;">{{ error }}</div>

          <div *ngIf="records.length">
            <h3 style="margin-top: 16px;">Bookings ({{ records.length }})</h3>
            <div class="history-list">
              <div class="history-item" *ngFor="let b of records" [class.selected]="expanded === b">
                <div class="history-row">
                  <span class="label">PNR</span>
                  <span class="value">{{ b.pnrOutbound || 'N/A' }}</span>
                </div>
                <div class="history-row">
                  <span class="label">Status</span>
                  <span class="value">{{ b.status }}</span>
                </div>
                <div class="history-row">
                  <span class="label">Source</span>
                  <span class="value">
                    <ng-container *ngIf="flightInfo(b.outboundFlightId) as f">
                      {{ f.sourceCity || 'N/A' }}
                    </ng-container>
                    <ng-container *ngIf="!flightInfo(b.outboundFlightId)">
                      N/A
                    </ng-container>
                  </span>
                </div>
                <div class="history-row">
                  <span class="label">Destination</span>
                  <span class="value">
                    <ng-container *ngIf="flightInfo(b.outboundFlightId) as f">
                      {{ f.destinationCity || 'N/A' }}
                    </ng-container>
                    <ng-container *ngIf="!flightInfo(b.outboundFlightId)">
                      N/A
                    </ng-container>
                  </span>
                </div>
                <button class="auth-btn" type="button" style="margin-top: 8px;" (click)="toggle(b)">
                  {{ expanded === b ? 'Hide Details' : 'View Details' }}
                </button>

                <div class="history-detail" *ngIf="expanded === b" [class.printable]="printTarget === b">
                  <h4>Booking Details</h4>
                  <div class="history-row">
                    <span class="label">Trip Type</span>
                    <span class="value">{{ b.tripType }}</span>
                  </div>
                  <div class="history-row">
                    <span class="label">Status</span>
                    <span class="value">{{ b.status }}</span>
                  </div>
                  <div class="history-row">
                    <span class="label">PNR Outbound</span>
                    <span class="value">{{ b.pnrOutbound || 'N/A' }}</span>
                  </div>
                  <div class="history-row" *ngIf="b.pnrReturn">
                    <span class="label">PNR Return</span>
                    <span class="value">{{ b.pnrReturn }}</span>
                  </div>
                  <ng-container *ngIf="flightInfo(b.outboundFlightId) as f">
                    <div class="history-row">
                      <span class="label">Flight Number</span>
                      <span class="value">{{ f.flightNumber || f.airlineCode || 'N/A' }}</span>
                    </div>
                    <div class="history-row">
                      <span class="label">Route</span>
                      <span class="value">{{ f.sourceCity || 'N/A' }} → {{ f.destinationCity || 'N/A' }}</span>
                    </div>
                    <div class="history-row">
                      <span class="label">Departure</span>
                      <span class="value">{{ f.departureDate || 'N/A' }} {{ f.departureTime || '' }}</span>
                    </div>
                    <div class="history-row">
                      <span class="label">Arrival</span>
                      <span class="value">{{ f.arrivalDate || 'N/A' }} {{ f.arrivalTime || '' }}</span>
                    </div>
                  </ng-container>
                  <div class="history-row" *ngIf="b.returnFlight">
                    <span class="label">Return Flight</span>
                    <span class="value">{{ b.returnFlight }}</span>
                  </div>
                  <ng-container *ngIf="b.returnFlight && flightInfo(b.returnFlight) as r">
                    <div class="history-row">
                      <span class="label">Return Flight No.</span>
                      <span class="value">{{ r.flightNumber || r.airlineCode || 'N/A' }}</span>
                    </div>
                    <div class="history-row">
                      <span class="label">Return Route</span>
                      <span class="value">{{ r.sourceCity || 'N/A' }} → {{ r.destinationCity || 'N/A' }}</span>
                    </div>
                    <div class="history-row">
                      <span class="label">Return Departure</span>
                      <span class="value">{{ r.departureDate || 'N/A' }} {{ r.departureTime || '' }}</span>
                    </div>
                    <div class="history-row">
                      <span class="label">Return Arrival</span>
                      <span class="value">{{ r.arrivalDate || 'N/A' }} {{ r.arrivalTime || '' }}</span>
                    </div>
                  </ng-container>
                  <div class="history-row">
                    <span class="label">Contact</span>
                    <span class="value">{{ b.contactName }} ({{ b.contactEmail }})</span>
                  </div>
                  <div class="history-row" *ngIf="passengerList(b.passengers).length">
                    <span class="label">Passenger Details</span>
                    <span class="value">
                      <div class="passenger-list">
                        <div class="passenger" *ngFor="let p of passengerList(b.passengers)">
                          <div class="passenger-row"><strong>Name:</strong> {{ p.name || 'N/A' }}</div>
                          <div class="passenger-row"><strong>Age:</strong> {{ p.age ?? 'N/A' }}</div>
                          <div class="passenger-row"><strong>Gender:</strong> {{ p.gender || 'N/A' }}</div>
                          <div class="passenger-row" *ngIf="p.seatOutbound || p.seatReturn">
                            <strong>Seat:</strong> {{ p.seatOutbound || p.seatReturn }}
                          </div>
                        </div>
                      </div>
                    </span>
                  </div>
                  <button class="search-btn" type="button" (click)="printTicket(b)">Print Ticket</button>
                </div>
              </div>
            </div>
          </div>
          <div *ngIf="!records.length && !pending && !error">No history loaded yet.</div>
        </div>
      </div>
    </main>
  `
})
export class HistoryComponent implements OnInit {
  email = '';
  pending = false;
  error = '';
  records: BookingRecord[] = [];
  expanded: BookingRecord | null = null;
  flightsById = new Map<string, any>();
  printTarget: BookingRecord | null = null;

  constructor(
    public auth: AuthService,
    private router: Router,
    private booking: BookingService,
    private cdr: ChangeDetectorRef
  ) {
    this.email = this.auth.getEmail() || this.auth.getUsername() || '';
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  ngOnInit() {
    if (!this.auth.isAuthenticated()) {
      console.warn('History: not authenticated');
      return;
    }
    if (!this.email) {
      this.error = 'No email found for this session. Please log in again.';
      console.warn('History: missing email/username in session');
      return;
    }
    this.fetchHistory();
    this.fetchFlights();
  }

  async fetchHistory() {
    if (!this.email) return;
    console.info('History: fetching bookings for', this.email);
    this.pending = true;
    this.error = '';
    try {
      const data = await firstValueFrom(this.booking.getHistory(this.email));
      this.records = Array.isArray(data) ? data : [];
      this.expanded = null;
      console.info('History: fetched', this.records.length, 'records', this.records);
      this.cdr.detectChanges();
    } catch (err: any) {
      this.error = 'Failed to load history.';
      this.records = [];
      this.expanded = null;
      console.error('History: error fetching history', err);
    } finally {
      this.pending = false;
      this.cdr.detectChanges();
    }
  }

  async fetchFlights() {
    try {
      const flights = await firstValueFrom(this.booking.getAllFlights());
      console.info('History: fetched flights', flights?.length ?? 0);
      this.flightsById.clear();
      flights.forEach((f: any) => {
        const ids = [f.flightId, f.id, f._id].filter(Boolean);
        ids.forEach((id) => this.flightsById.set(id, f));
      });
      this.cdr.detectChanges();
    } catch (err) {
      // fail silently; will fall back to IDs
      console.warn('History: failed to fetch flights', err);
    }
  }

  flightInfo(id: string | null | undefined) {
    if (!id) return null;
    return this.flightsById.get(id) || null;
  }

  toggle(record: BookingRecord) {
    this.expanded = this.expanded === record ? null : record;
  }

  flightRoute(id: string | null | undefined) {
    const f = this.flightInfo(id);
    if (!f) return null;
    return `${f.sourceCity ?? ''} → ${f.destinationCity ?? ''}`.trim();
  }

  passengerList(passengers: any): any[] {
    return Array.isArray(passengers) ? passengers : [];
  }

  printTicket(record: BookingRecord) {
    this.printTarget = record;
    this.expanded = record;
    this.cdr.detectChanges();
    setTimeout(() => {
      window.print();
      this.printTarget = null;
      this.cdr.detectChanges();
    }, 50);
  }
}
