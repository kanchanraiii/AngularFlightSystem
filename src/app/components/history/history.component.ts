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
  templateUrl: './history.html'
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

  cancelTarget: BookingRecord | null = null;

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
    if (!this.auth.isAuthenticated()) return;
    if (!this.email) {
      this.error = 'No email found for this session. Please log in again.';
      return;
    }
    this.fetchHistory();
    this.fetchFlights();
  }

  async fetchHistory() {
    if (!this.email) return;
    this.pending = true;
    this.error = '';
    try {
      const data = await firstValueFrom(this.booking.getHistory(this.email));
      this.records = Array.isArray(data) ? data : [];
      this.expanded = null;
    } catch {
      this.error = 'Failed to load history.';
      this.records = [];
    } finally {
      this.pending = false;
      this.cdr.detectChanges();
    }
  }

  async fetchFlights() {
    try {
      const flights = await firstValueFrom(this.booking.getAllFlights());
      this.flightsById.clear();
      flights.forEach((f: any) => {
        [f.flightId, f.id, f._id].filter(Boolean)
          .forEach((id) => this.flightsById.set(id, f));
      });
    } catch {}
  }

  flightInfo(id: string | null | undefined) {
    return id ? this.flightsById.get(id) || null : null;
  }

  toggle(record: BookingRecord) {
    this.expanded = this.expanded === record ? null : record;
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

  openCancelModal(record: BookingRecord) {
    this.cancelTarget = record;
  }

  closeCancelModal() {
    this.cancelTarget = null;
  }

  confirmCancel() {
    if (!this.cancelTarget) return;
    this.cancelBooking(this.cancelTarget);
    this.cancelTarget = null;
  }

  async cancelBooking(record: BookingRecord) {
    const token = this.auth.getToken();
    if (!token) {
      this.showToast('Not authenticated', 'error');
      return;
    }

    const pnr = (record.pnrOutbound || record.bookingId || '').toUpperCase();
    if (!pnr || this.cancelling.has(pnr)) return;

    this.cancelling.add(pnr);
    this.cdr.detectChanges();

    try {
      const res = await firstValueFrom(this.booking.cancelBooking(pnr, token));
      if (res?.status === 200 || res?.status === 204) {
        record.status = 'Cancelled';
        this.showToast('Booking cancelled', 'success');
        this.fetchHistory();
      } else {
        this.showToast('Failed to cancel booking', 'error');
      }
    } catch {
      this.showToast('Failed to cancel booking', 'error');
    } finally {
      this.cancelling.delete(pnr);
      this.cdr.detectChanges();
    }
  }

  isCancelling(record: BookingRecord) {
    const pnr = (record.pnrOutbound || record.bookingId || '').toUpperCase();
    return !!pnr && this.cancelling.has(pnr);
  }
}
