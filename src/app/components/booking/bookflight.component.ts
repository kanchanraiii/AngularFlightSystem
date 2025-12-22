import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { ToastComponent } from '../shared/toast.component';

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
  }

  addPassenger(): void {
    if (this.isSubmitting) return;
    this.passengers.push({ name: '', age: null, gender: '', seatOutbound: '' });
  }

  removePassenger(index: number): void {
    if (this.isSubmitting) return;
    if (this.passengers.length > 1) this.passengers.splice(index, 1);
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
  // =========================
