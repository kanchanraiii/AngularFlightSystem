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
  templateUrl:'./history.html' 
})
export class HistoryComponent implements OnInit {
  email = '';
  pending = false;
  error = '';
  records: BookingRecord[] = [];
  expanded: BookingRecord | null = null;
  flightsById = new Map<string, any>();
  printTarget: BookingRecord | null = null;
  toastMessage = '';
  toastType: '' | 'success' | 'error' = '';
  cancelling = new Set<string>();

  constructor(
    public auth: AuthService,
    private router: Router,
    private booking: BookingService,
    private cdr: ChangeDetectorRef
  ) {
    this.email = this.auth.getEmail() || this.auth.getUsername() || '';
  }

  logout() {
    if (!confirm('Do you really want to log out?')) return;
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

  showToast(message: string, type: 'success' | 'error') {
    this.toastMessage = message;
    this.toastType = type;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.toastMessage = '';
      this.toastType = '';
      this.cdr.detectChanges();
    }, 3000);
  }

  async cancelBooking(record: BookingRecord) {
    const token = this.auth.getToken();
    if (!token) {
      this.showToast('Not authenticated', 'error');
      return;
    }
    const pnr = (record.pnrOutbound || record.bookingId || '').toString();
    if (!pnr) {
      this.showToast('Missing PNR for this booking', 'error');
      return;
    }
    const p = pnr.toUpperCase();
    if (this.cancelling.has(p)) return;
    this.cancelling.add(p);
    this.cdr.detectChanges();
    try {
      const res = await firstValueFrom(this.booking.cancelBooking(p, token));
      const r: any = res;
      if (r.status === 200 || r.status === 204) {
        record.status = 'Cancelled';
        this.showToast('Booking cancelled', 'success');
        this.fetchHistory();
      } else {
        this.showToast('Failed to cancel booking', 'error');
      }
    } catch (err) {
      this.showToast('Failed to cancel booking', 'error');
    } finally {
      this.cancelling.delete(p);
      this.cdr.detectChanges();
    }
  }

  isCancelling(record: BookingRecord) {
    const pnr = (record.pnrOutbound || record.bookingId || '').toString().toUpperCase();
    return !!pnr && this.cancelling.has(pnr);
  }
  
}
