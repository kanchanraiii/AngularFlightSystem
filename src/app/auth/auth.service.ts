import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly baseUrl = 'http://localhost:9000/auth';

  constructor(private http: HttpClient) {}

  login(payload: unknown) {
    throw new Error('login not implemented yet');
  }

  register(payload: unknown) {
    throw new Error('register not implemented yet');
  }
}
