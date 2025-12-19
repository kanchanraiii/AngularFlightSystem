import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule   
  ],
  templateUrl: './booking.html',
  styleUrls: ['./booking.css']   
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
    private route: ActivatedRoute,
    public auth: AuthService,     
    private router: Router        
  ) {}

  ngOnInit() {
    this.flightId = this.route.snapshot.queryParamMap.get('flightId');
  }

  addPassenger() {
    this.passengers.push({
      name: '',
      age: null,
      gender: '',
      seatOutbound: ''
    });
  }

  removePassenger(index: number) {
    this.passengers.splice(index, 1);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
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
