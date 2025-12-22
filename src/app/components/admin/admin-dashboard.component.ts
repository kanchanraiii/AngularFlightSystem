import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { RouterModule, Router } from '@angular/router';
import {FlightAdminService,Flight} from '../../services/flight-admin.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.html',
   imports: [RouterModule, CommonModule]
})
export class AdminDashboardComponent {
  flights:Flight[]=[];
  loading=false;
  error='';
  constructor(private auth: AuthService,private router: Router,private flightService:FlightAdminService) {
  }

  ngOnInit():void{
    this.loadFlights();
  }

  loadFlights(){
    this.loading = true;
    this.error = '';
    this.flightService.getAllFlights().subscribe({
      next: (data) => {
        this.flights = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load flights';
        this.loading = false;
      }
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
