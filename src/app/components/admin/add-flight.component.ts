import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FlightAdminService } from '../../services/flight-admin.service';
import { finalize } from 'rxjs/operators';

@Component({
  standalone: true,
  selector: 'app-add-flight',
  templateUrl: './add-flight.html',
  imports: [CommonModule, FormsModule, RouterModule]
})
export class AddFlightComponent implements OnInit {

  today = new Date().toISOString().split('T')[0];

  loading = false;
  successMsg = '';
  errorMsg = '';

  flightNumberExists = false;
  existingFlightNumbers: string[] = [];   

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
    mealAvailable: false
  };

  constructor(
    private service: FlightAdminService,
    private auth: AuthService,
    private router: Router
  ) {}

  
  ngOnInit(): void {
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

  isValid(): boolean {
    if (
      !this.flight.airlineCode ||
      !this.flight.flightNumber ||
      !this.flight.sourceCity ||
      !this.flight.destinationCity ||
      !this.flight.departureDate ||
      !this.flight.departureTime ||
      !this.flight.arrivalDate ||
      !this.flight.arrivalTime ||
      this.flight.totalSeats === null ||
      this.flight.price === null
    ) {
      return false;
    }

    if (this.flight.sourceCity === this.flight.destinationCity) {
      return false;
    }

    if (this.flight.totalSeats <= 0 || this.flight.price <= 0) {
      return false;
    }

    if (this.flightNumberExists) {
      return false;
    }

    const dep = new Date(
      `${this.flight.departureDate}T${this.flight.departureTime}`
    );
    const arr = new Date(
      `${this.flight.arrivalDate}T${this.flight.arrivalTime}`
    );

    return arr > dep;
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
    if (!this.isValid()) return;

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
      mealAvailable: this.flight.mealAvailable
    };

    this.service
      .addFlight(payload)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          if (res?.error) {
            this.errorMsg = res.error;
            this.successMsg = '';
          } else {
            this.successMsg = 'Flight added successfully';
            this.errorMsg = '';

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
      mealAvailable: false
    };

    this.flightNumberExists = false;
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
