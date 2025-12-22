import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FlightAdminService } from '../../services/flight-admin.service';
import { finalize } from 'rxjs/operators';
import { ToastService } from '../../services/toast.service';
import { ToastComponent } from '../shared/toast.component';
import { AirlineAdminService } from '../../services/airline-admin.service';

type AirlineOption = { code: string; name: string };

@Component({
  standalone: true,
  selector: 'app-add-flight',
  templateUrl: './add-flight.html',
  imports: [CommonModule, FormsModule, RouterModule, ToastComponent]
})
export class AddFlightComponent implements OnInit {

  today = new Date().toISOString().split('T')[0];

  loading = false;
  successMsg = '';
  errorMsg = '';

  flightNumberExists = false;
  existingFlightNumbers: string[] = [];
  availableAirlines: AirlineOption[] = [];

  allowedCities: string[] = [
    'KANPUR',
    'LUCKNOW',
    'VARANASI',
    'DELHI',
    'BANGALORE',
    'MUMBAI',
    'CHENNAI',
    'HYDERABAD',
    'PUNE',
    'GUWAHATI',
    'COIMBATORE',
    'MYSORE',
    'KOCHI',
    'SRINAGAR'
  ];

  flight = {
    airlineCode: '',
    flightNumber: '',
    sourceCity: '',
    destinationCity: '',
    departureDate: '',
    departureTime: '',
    arrivalDate: '',
    arrivalTime: '',
    totalSeats: null as number | null,
    price: null as number | null,
    mealAvailable: null as boolean | null
  };

  constructor(
    private service: FlightAdminService,
    private airlineService: AirlineAdminService,
    private auth: AuthService,
    private router: Router,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  
  ngOnInit(): void {
    this.loadFlights();
    this.loadAirlines();
  }

  private loadFlights() {
    this.service.getAllFlights().subscribe({
      next: (flights) => {
        this.existingFlightNumbers = (flights || [])
          .map(f => f.flightNumber?.toUpperCase())
          .filter(Boolean);
      },
      error: () => {
        this.existingFlightNumbers = [];
      }
    });
  }

  private loadAirlines() {
    this.airlineService.getAllAirlines().subscribe({
      next: (airlines) => {
        this.availableAirlines = Array.isArray(airlines)
          ? airlines
              .map(a => ({
                code: (a?.airlineCode || '').toString().toUpperCase(),
                name: (a?.airlineName || '').toString()
              }))
              .filter(a => !!a.code)
          : [];
      },
      error: () => {
        this.availableAirlines = [];
      }
    });
  }

  isValid(): boolean {
    return !this.validateForm();
  }

  airlineError(): string {
    if (!this.flight.airlineCode) return 'Select an airline';
    if (!this.isKnownAirline(this.flight.airlineCode)) {
      return 'Choose a listed airline';
    }
    return '';
  }

  flightNumberError(): string {
    if (!this.flight.flightNumber) return 'Flight number is required';
    if (!/^[A-Z0-9]{2,8}$/.test(this.flight.flightNumber)) {
      return 'Flight number must be 2-8 letters/numbers';
    }
    if (this.flightNumberExists) return 'Flight number already exists';
    return '';
  }

  seatsError(): string {
    if (this.flight.totalSeats === null) return 'Total seats are required';
    if (this.flight.totalSeats <= 0) return 'Total seats must be greater than 0';
    return '';
  }

  priceError(): string {
    if (this.flight.price === null) return 'Price is required';
    if (this.flight.price <= 0) return 'Price must be greater than 0';
    return '';
  }

  departureError(): string {
    if (!this.flight.departureDate) return 'Departure date is required';
    if (!this.flight.departureTime) return 'Departure time is required';
    return '';
  }

  arrivalError(): string {
    if (!this.flight.arrivalDate) return 'Arrival date is required';
    if (!this.flight.arrivalTime) return 'Arrival time is required';

    const dep = this.flight.departureDate && this.flight.departureTime
      ? new Date(`${this.flight.departureDate}T${this.flight.departureTime}`)
      : null;
    const arr = new Date(`${this.flight.arrivalDate}T${this.flight.arrivalTime}`);

    if (dep && !(arr > dep)) {
      return 'Arrival must be after departure';
    }
    return '';
  }

  sourceError(): string {
    if (!this.flight.sourceCity) return 'Select a source city';
    return '';
  }

  destinationError(): string {
    if (!this.flight.destinationCity) return 'Select a destination city';
    if (this.flight.sourceCity && this.flight.destinationCity && this.flight.sourceCity === this.flight.destinationCity) {
      return 'Destination must differ from source';
    }
    return '';
  }

  mealError(): string {
    if (this.flight.mealAvailable === null || this.flight.mealAvailable === undefined) {
      return 'Select meal availability';
    }
    return '';
  }

  private validateForm(): string | null {
    if (!this.flight.airlineCode) return 'Select an airline';
    if (!this.flight.flightNumber) return 'Flight number is required';
    if (!/^[A-Z0-9]{2,8}$/.test(this.flight.flightNumber)) {
      return 'Flight number must be 2-8 letters/numbers';
    }
    if (this.flightNumberExists) return 'Flight number already exists';

    if (!this.flight.sourceCity || !this.flight.destinationCity) {
      return 'Source and destination are required';
    }
    if (this.flight.sourceCity === this.flight.destinationCity) {
      return 'Source and destination must differ';
    }

    if (!this.flight.departureDate || !this.flight.departureTime) {
      return 'Departure date and time are required';
    }
    if (!this.flight.arrivalDate || !this.flight.arrivalTime) {
      return 'Arrival date and time are required';
    }

    const dep = new Date(
      `${this.flight.departureDate}T${this.flight.departureTime}`
    );
    const arr = new Date(
      `${this.flight.arrivalDate}T${this.flight.arrivalTime}`
    );
    if (!(arr > dep)) return 'Arrival must be after departure';

    if (this.flight.totalSeats === null || this.flight.totalSeats <= 0) {
      return 'Total seats must be greater than 0';
    }
    if (this.flight.price === null || this.flight.price <= 0) {
      return 'Price must be greater than 0';
    }

    if (this.flight.mealAvailable === null || this.flight.mealAvailable === undefined) {
      return 'Select meal availability';
    }

    if (
      this.availableAirlines.length &&
      !this.isKnownAirline(this.flight.airlineCode)
    ) {
      return 'Choose an airline from the list';
    }

    return null;
  }

 
  onFlightNumberChange() {
    const value = this.flight.flightNumber?.trim().toUpperCase();

    if (!value) {
      this.flightNumberExists = false;
      return;
    }

    this.flight.flightNumber = value; // normalize input
    this.flightNumberExists = this.existingFlightNumbers.includes(value);
  }

  
  submit() {
    const error = this.validateForm();
    if (error) {
      this.errorMsg = error;
      this.successMsg = '';
      this.toast.show(error, 'error');
      return;
    }

    this.loading = true;
    this.successMsg = 'Saving flight...';
    this.errorMsg = '';

    const payload = {
      airlineCode: this.flight.airlineCode.trim().toUpperCase(),
      flightNumber: this.flight.flightNumber.trim().toUpperCase(),
      sourceCity: this.flight.sourceCity,
      destinationCity: this.flight.destinationCity,
      departureDate: this.flight.departureDate,
      departureTime: this.flight.departureTime,
      arrivalDate: this.flight.arrivalDate,
      arrivalTime: this.flight.arrivalTime,
      totalSeats: Number(this.flight.totalSeats),
      price: Number(this.flight.price),
      mealAvailable: Boolean(this.flight.mealAvailable)
    };

    console.log('[AddFlight] Payload ready', payload);

    this.service
      .addFlight(payload)
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (res) => {
          if (res?.error) {
            this.errorMsg = res.error;
            this.successMsg = '';
            this.toast.show(this.errorMsg, 'error');
          } else {
            this.successMsg = 'Flight added successfully';
            this.errorMsg = '';
            this.toast.show(this.successMsg, 'success');

            // update cache so duplicate works immediately
            this.existingFlightNumbers.push(payload.flightNumber);

            this.resetForm();
          }

          setTimeout(() => {
            this.successMsg = '';
            this.errorMsg = '';
          }, 2500);
        },
        error: (err) => {
          this.successMsg = '';
          this.errorMsg = err?.error?.error || 'Failed to add flight';
          this.toast.show(this.errorMsg, 'error');

          setTimeout(() => {
            this.errorMsg = '';
          }, 2500);
        }
      });
  }

  resetForm() {
    this.flight = {
      airlineCode: '',
      flightNumber: '',
      sourceCity: '',
      destinationCity: '',
      departureDate: '',
      departureTime: '',
      arrivalDate: '',
      arrivalTime: '',
      totalSeats: null,
      price: null,
      mealAvailable: null
    };

    this.flightNumberExists = false;
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  private isKnownAirline(code: string | null | undefined): boolean {
    const normalized = (code || '').toUpperCase();
    if (!normalized) return false;
    return this.availableAirlines.some(a => a.code === normalized);
  }
}
