import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import {FlightAdminService,Flight} from '../../services/flight-admin.service';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.html',
  imports: [RouterModule, CommonModule, FormsModule]
})
export class AdminDashboardComponent implements OnInit {

  allFlights: Flight[] = [];
  filteredFlights: Flight[] = [];
  selectedAirline = '';
  selectedStatus = 'ALL';
  loading = false;
  error = '';
  constructor(
    private auth: AuthService,
    private router: Router,
    private flightService: FlightAdminService
  ) {}

  ngOnInit(): void {
    this.loadFlights();
  }

  loadFlights() {
    this.loading = true;

    this.flightService.getAllFlights().subscribe({
      next: (data) => {
        this.allFlights = data;
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load flights';
        this.loading = false;
      }
    });
  }

  applyFilters() {
    this.filteredFlights = this.allFlights.filter(flight => {
      if (this.selectedAirline && flight.airlineCode !== this.selectedAirline) {
        return false;
      }
      if (this.selectedStatus !== 'ALL') {
        const isDeparted = this.isDepartedFlight(flight);
        if (this.selectedStatus === 'LIVE' && isDeparted) {
          return false;
        }
        if (this.selectedStatus === 'DEPARTED' && !isDeparted) {
          return false;
        }
      }
      return true;
    });
  }

  isDepartedFlight(flight: Flight): boolean {
    const today = new Date();
    const departureDateTime = new Date(
      `${flight.departureDate}T${flight.departureTime}`
    );
    return departureDateTime < today;
  }

  get uniqueAirlines(): string[] {
    return Array.from(
      new Set(this.allFlights.map(f => f.airlineCode))
    );
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
