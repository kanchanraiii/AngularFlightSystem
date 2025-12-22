import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Flight {
  flightId: string;
  flightNumber: string;
  airlineCode: string;
  sourceCity: string;
  destinationCity: string;
  departureDate: string;
  arrivalDate: string;
  departureTime: string;
  arrivalTime: string;
  mealAvailable: boolean;
  totalSeats: number;
  availableSeats: number;
  price: number;
}
@Injectable({
  providedIn: 'root'
})
export class FlightAdminService {
  private readonly baseUrl =
    'http://localhost:9000/flight/api/flight';
  constructor(private http: HttpClient) {

  }
  getAllFlights(): Observable<Flight[]> {
    return this.http.get<Flight[]>(
      `${this.baseUrl}/getAllFlights`
    );
  }
}
