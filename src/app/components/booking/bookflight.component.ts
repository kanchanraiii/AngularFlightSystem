import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { ToastComponent } from '../shared/toast.component';
import { catchError, forkJoin, of } from 'rxjs';

type SeatCell = {
  code: string;
  booked: boolean;
  available: boolean;
  selectedBy: number | null;
};

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ToastComponent
  ],
  templateUrl: './booking.html',
  styleUrls: ['./booking.css']
})
export class BookingComponent implements OnInit {
  private readonly baseUrl =
    window.location.port === '9000'
      ? 'http://localhost:9000/booking/api/booking'
      : '/booking/api/booking';

  private readonly flightBaseUrl =
    window.location.port === '9000'
      ? 'http://localhost:9000/flight/api/flight'
      : '/flight/api/flight';

  tripType = '';
  contactName = '';
  contactEmail = '';
  message = '';
  isSubmitting = false;

  passengers: { name: string; age: number | null; gender: string; seatOutbound: string; }[] = [
    { name: '', age: null, gender: '', seatOutbound: '' }
  ];

  flightId: string | null = null;
  bookingSuccess = false;
  bookingResponse: any = null;
  flightDetails: any = null;

  seatList: SeatCell[] = [];
  seatRows: SeatCell[][] = [];
  seatLoading = false;
  seatError = '';
  activePassengerIndex = 0;
  private readonly seatsPerRow = 4;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    public auth: AuthService,
    private router: Router,
    private toast: ToastService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.flightId = this.route.snapshot.queryParamMap.get('flightId');
    this.contactEmail = localStorage.getItem('auth_email') || '';
    if (this.flightId) {
      this.loadSeatMap(this.flightId);
    }
  }

  addPassenger(): void {
    if (this.isSubmitting) return;
    this.passengers.push({ name: '', age: null, gender: '', seatOutbound: '' });
    this.activePassengerIndex = this.passengers.length - 1;
    this.refreshSeatSelections();
  }

  removePassenger(index: number): void {
    if (this.isSubmitting) return;
    if (this.passengers.length > 1) {
      const seat = this.passengers[index]?.seatOutbound;
      this.passengers.splice(index, 1);
      if (seat) {
        this.unassignSeat(seat);
      }
      if (this.activePassengerIndex >= this.passengers.length) {
        this.activePassengerIndex = this.passengers.length - 1;
      }
      this.refreshSeatSelections();
    }
  }

  logout(): void {
    if (!confirm('Do you really want to log out?')) return;
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  submit(form: NgForm): void {
    console.log('[Booking] submit start', { isSubmitting: this.isSubmitting, flightId: this.flightId });
    if (this.isSubmitting) return;
    if (!this.flightId) {
      console.log('[Booking] missing flightId');
      this.toast.show('Missing flight selection', 'error');
      return;
    }
    // mark all controls touched to trigger validation state
    Object.values(form.controls).forEach((c: any) => c.control?.markAsTouched?.());
    this.cd.detectChanges();

    if (!this.validateForm(form)) {
      return;
    }

    this.isSubmitting = true;
    this.message = '';

    const payload = {
      tripType: this.tripType,
      contactName: this.contactName,
      contactEmail: this.contactEmail,
      passengers: this.passengers
    };

    console.log('[Booking] sending payload', payload);

    this.http.post(`${this.baseUrl}/${this.flightId}`, payload, { observe: 'response' }).subscribe({
      next: (res: HttpResponse<any>) => {
        console.log('[Booking] response received', res.status, res.body);
        if (res.status === 200 || res.status === 201) {
          this.bookingResponse = res.body;
          console.log('[Booking] about to show success toast');
          this.toast.show('Thanks for booking!', 'success');
          this.bookingSuccess = true;
          this.cd.detectChanges();
          console.log('[Booking] bookingSuccess set true');
        } else {
          this.message = 'Unexpected server response';
          console.log('[Booking] unexpected response', res.status);
          this.toast.show(this.message, 'error');
        }
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('[Booking] request failed', err);
        this.message = err?.status === 0
          ? 'Booking service unreachable. Check backend/proxy.'
          : 'Booking failed';
        this.toast.show(this.message, 'error');
        this.isSubmitting = false;
      }
    });
  }

  loadSeatMap(flightId: string): void {
    this.seatLoading = true;
    this.seatError = '';

    const flights$ = this.http.get<any[]>(`${this.flightBaseUrl}/getAllFlights`)
      .pipe(
        catchError((err) => {
          console.error('[Booking] failed to load flights for seat map', err);
          this.seatError = 'Flight data unavailable. Showing default seats.';
          return of([]);
        })
      );

    const seats$ = this.http.get<any[]>(`${this.flightBaseUrl}/${flightId}/seats`).pipe(
      catchError((err) => {
        console.warn('[Booking] seat map fetch failed, falling back to generated seats', err);
        if (!this.seatError) {
          this.seatError = 'Seat map unavailable. Using generated layout.';
        }
        return of([]);
      })
    );

    forkJoin({ flights: flights$, seats: seats$ }).subscribe({
      next: ({ flights, seats }) => {
        this.flightDetails = Array.isArray(flights)
          ? flights.find((f) => f.flightId === flightId)
          : null;
        this.buildSeatMap(Array.isArray(seats) ? seats : []);
        this.seatLoading = false;
      },
      error: (err) => {
        console.error('[Booking] seat map load failed', err);
        this.seatError = 'Unable to load seat map.';
        this.buildSeatMap([]);
        this.seatLoading = false;
      }
    });
  }

  private buildSeatMap(payload: any[]): void {
    const seats: SeatCell[] = [];
    const inferredTotal = this.flightDetails?.totalSeats || payload?.length || 0;

    if (Array.isArray(payload) && payload.length > 0) {
      payload.forEach((s, idx) => {
        const code = s?.seatNo || s?.seatId || s?.code || `S${idx + 1}`;
        const booked = Boolean(s?.booked) || s?.available === false;
        seats.push({
          code,
          booked,
          available: !booked,
          selectedBy: null
        });
      });
    } else {
      const total = inferredTotal > 0 ? inferredTotal : 24;
      for (let i = 1; i <= total; i++) {
        seats.push({
          code: `S${i}`,
          booked: false,
          available: true,
          selectedBy: null
        });
      }
    }

    this.seatList = seats;
    this.refreshSeatSelections();
  }

  private chunkSeats(list: SeatCell[], size: number): SeatCell[][] {
    const rows: SeatCell[][] = [];
    for (let i = 0; i < list.length; i += size) {
      rows.push(list.slice(i, i + size));
    }
    return rows;
  }

  private refreshSeatSelections(): void {
    this.seatList.forEach((s) => {
      if (!s.booked && s.available !== false) {
        s.selectedBy = null;
      }
    });
    this.passengers.forEach((p, idx) => {
      if (p.seatOutbound) {
        this.markSeatSelected(p.seatOutbound, idx, false);
      }
    });
    this.seatRows = this.chunkSeats(this.seatList, this.seatsPerRow);
  }

  private markSeatSelected(code: string, passengerIndex: number, warnIfTaken = true): void {
    const seat = this.seatList.find((s) => s.code === code);
    if (!seat || seat.booked || seat.available === false) return;

    if (seat.selectedBy !== null && seat.selectedBy !== passengerIndex) {
      if (warnIfTaken) {
        this.toast.show('Seat already selected for another passenger', 'error');
      }
      return;
    }

    seat.selectedBy = passengerIndex;
  }

  private unassignSeat(code: string): void {
    const seat = this.seatList.find((s) => s.code === code);
    if (seat) {
      seat.selectedBy = null;
    }
  }

  setActivePassenger(index: number): void {
    this.activePassengerIndex = index;
  }

  toggleSeat(seat: SeatCell): void {
    if (seat.booked || seat.available === false) return;
    const idx = this.activePassengerIndex;
    const current = this.passengers[idx];
    if (!current) return;

    if (current.seatOutbound === seat.code) {
      current.seatOutbound = '';
      seat.selectedBy = null;
      this.seatRows = this.chunkSeats(this.seatList, this.seatsPerRow);
      return;
    }

    this.unassignSeat(current.seatOutbound);

    if (seat.selectedBy !== null && seat.selectedBy !== idx) {
      this.toast.show('Seat already selected for another passenger', 'error');
      return;
    }

    seat.selectedBy = idx;
    current.seatOutbound = seat.code;
    this.seatRows = this.chunkSeats(this.seatList, this.seatsPerRow);
  }

  validateForm(form: NgForm): boolean {
    if (!this.tripType) {
      this.toast.show('Select trip type', 'error');
      return false;
    }

    if (!this.contactName || this.contactName.trim().length === 0) {
      this.toast.show('Enter contact name', 'error');
      return false;
    }

    const emailRe = /^\S+@\S+\.\S+$/;
    if (!this.contactEmail || !emailRe.test(this.contactEmail)) {
      this.toast.show('Enter a valid contact email', 'error');
      return false;
    }

    if (!Array.isArray(this.passengers) || this.passengers.length === 0) {
      this.toast.show('Add at least one passenger', 'error');
      return false;
    }

    for (let i = 0; i < this.passengers.length; i++) {
      const p = this.passengers[i];
      if (!p.name || p.name.trim().length === 0) {
        this.toast.show(`Passenger ${i + 1}: name is required`, 'error');
        return false;
      }
      if (p.age == null || p.age <= 0) {
        this.toast.show(`Passenger ${i + 1}: enter a valid age`, 'error');
        return false;
      }
      if (!p.gender) {
        this.toast.show(`Passenger ${i + 1}: select gender`, 'error');
        return false;
      }
      if (!p.seatOutbound || p.seatOutbound.trim().length === 0) {
        this.toast.show(`Passenger ${i + 1}: seat is required`, 'error');
        return false;
      }
    }

    return true;
  }

  closeAndGoHome(): void {
    this.router.navigate(['/']);
  }
}
