import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="!flightId" style="color:red">
      <h2>Invalid Access</h2>
      <p>Flight ID is missing. Please select a flight first.</p>
    </div>

   
    <div *ngIf="flightId && !bookingSuccess">
      <h2>Flight Booking</h2>

      <form #form="ngForm" (ngSubmit)="submit(form)">

        <label>Trip Type</label>
        <select name="tripType" [(ngModel)]="tripType" required>
          <option value="">Select</option>
          <option value="ONE_WAY">One Way</option>
          <option value="ROUND_TRIP">Round Trip</option>
        </select>

        <br /><br />

        <label>Contact Name</label>
        <input type="text" name="contactName" [(ngModel)]="contactName" required />

        <br /><br />

        <label>Contact Email</label>
        <input type="email" name="contactEmail" [(ngModel)]="contactEmail" required />

        <br /><br />

        <h3>Passengers</h3>

        <div *ngFor="let p of passengers; let i = index">
          <h4>Passenger {{ i + 1 }}</h4>

          <input type="text" name="name{{i}}" [(ngModel)]="p.name" placeholder="Name" required />
          <br />

          <input type="number" name="age{{i}}" [(ngModel)]="p.age" placeholder="Age" required />
          <br />

          <select name="gender{{i}}" [(ngModel)]="p.gender" required>
            <option value="">Gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
          <br />

          <input type="text" name="seat{{i}}" [(ngModel)]="p.seatOutbound" placeholder="Seat" required />
          <br />

          <button type="button" (click)="removePassenger(i)" *ngIf="passengers.length > 1">
            Remove Passenger
          </button>

          <hr />
        </div>

        <button type="button" (click)="addPassenger()">+ Add Passenger</button>

        <br /><br />

        <button type="submit">Book Ticket</button>
      </form>

      <p style="color:red">{{ message }}</p>
    </div>

   
    <div *ngIf="bookingSuccess" class="confirmation">
      <h2>Thank You! Booking Confirmed</h2>

      <p><strong>Status:</strong> {{ bookingResponse.status }}</p>
      <p><strong>Booking ID:</strong> {{ bookingResponse.bookingId }}</p>
      <p><strong>Trip Type:</strong> {{ bookingResponse.tripType }}</p>
      <p><strong>Outbound Flight ID:</strong> {{ bookingResponse.outboundFlightId }}</p>
      <p><strong>PNR:</strong> {{ bookingResponse.pnrOutbound }}</p>
      <p><strong>Total Passengers:</strong> {{ bookingResponse.totalPassengers }}</p>
      <p><strong>Contact Name:</strong> {{ bookingResponse.contactName }}</p>
      <p><strong>Contact Email:</strong> {{ bookingResponse.contactEmail }}</p>

      <div *ngIf="bookingResponse.warnings?.length">
        <p style="color: orange;"> {{ bookingResponse.warnings[0] }}</p>
      </div>
    </div>
  `
})
export class BookingComponent implements OnInit {

  tripType = '';
  contactName = '';
  contactEmail = '';
  message = '';

  passengers = [
    { name: '', age: null as number | null, gender: '', seatOutbound: '' }
  ];

  flightId: string | null = null;
  bookingSuccess = false;
  bookingResponse: any;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.flightId = this.route.snapshot.queryParamMap.get('flightId');
  }

  addPassenger() {
    this.passengers.push({ name: '', age: null, gender: '', seatOutbound: '' });
  }

  removePassenger(index: number) {
    this.passengers.splice(index, 1);
  }

  submit(form: NgForm) {
    if (form.invalid) {
      this.message = 'Please fill all fields';
      return;
    }

    const payload = {
      tripType: this.tripType,
      contactName: this.contactName,
      contactEmail: this.contactEmail,
      passengers: this.passengers
    };

    this.http.post(
      `http://localhost:9000/booking/api/booking/${this.flightId}`,
      payload,
      { observe: 'response' }
    ).subscribe({
      next: (res: HttpResponse<any>) => {
        if (res.status === 201) {
          this.bookingResponse = res.body;
          this.bookingSuccess = true;
        } else {
          this.message = 'Unexpected response from server';
        }
      },
      error: () => {
        this.message = 'Booking failed';
      }
    });
  }
}
