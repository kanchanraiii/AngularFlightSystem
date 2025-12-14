import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export type BookingRecord = {
  bookingId: string;
  tripType: string;
  outboundFlightId: string;
  returnFlight: string | null;
  pnrOutbound: string | null;
  passengers: unknown;
  warnings: unknown;
  pnrReturn: string | null;
  contactName: string;
  contactEmail: string;
  totalPassengers: number;
  status: string;
};

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private readonly baseUrl = '/booking/api/booking';
  private readonly flightBaseUrl = '/flight/api/flight';

  constructor(private http: HttpClient) {}

  getHistory(email: string) {
    return this.http.get<BookingRecord[]>(`${this.baseUrl}/history/${encodeURIComponent(email)}`);
  }

  getAllFlights() {
    return this.http.get<any[]>(`${this.flightBaseUrl}/getAllFlights`);
  }
}
