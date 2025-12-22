import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


export interface Flight {
  flightId?: string;
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
  availableSeats?: number;
  price: number;
}

@Injectable({
  providedIn: 'root'
})
export class FlightAdminService {

 
  private readonly flightBaseUrl =
    'http://localhost:9000/flight/api/flight';

  private readonly inventoryBaseUrl =
    'http://localhost:9000/flight/api/flight/airline/inventory';

  constructor(private http: HttpClient) {}


  getAllFlights(): Observable<Flight[]> {
    return this.http.get<Flight[]>(
      `${this.flightBaseUrl}/getAllFlights`
    );
  }

  addFlight(payload: Flight): Observable<any> {
    return this.http.post<any>(
      `${this.inventoryBaseUrl}/add`,
      payload
    );
  }
}
