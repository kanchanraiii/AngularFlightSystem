import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AddAirlineRequest {
  airlineCode: string;
  airlineName: string;
}

@Injectable({
  providedIn: 'root',
})
export class AirlineAdminService {
  private readonly baseUrl = 'http://localhost:9000/flight/api/flight';

  constructor(private http: HttpClient) {}

  addAirline(payload: AddAirlineRequest) {
    return this.http.post<any>(`${this.baseUrl}/addAirline`, payload);
  }
}
