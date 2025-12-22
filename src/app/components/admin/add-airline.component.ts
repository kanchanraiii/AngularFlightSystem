import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AirlineAdminService } from '../../services/airline-admin.service';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-add-airline',
  templateUrl: './add-airline.html',
  imports: [CommonModule, FormsModule, RouterModule]
})
export class AddAirlineComponent {

  airlineCode = '';
  airlineName = '';

  loading = false;
  successMsg = '';
  errorMsg = '';

  constructor(
    private airlineService: AirlineAdminService,
    private auth: AuthService,
    private router: Router
  ) {}

  submit() {
    if (!this.airlineCode || !this.airlineName) {
      this.errorMsg = 'Please fill all fields';
      this.successMsg = '';
      return;
    }

    this.loading = true;
    this.airlineService.addAirline({
      airlineCode: this.airlineCode.trim().toUpperCase(),
      airlineName: this.airlineName.trim()
    }).subscribe({
      next: (res) => {

        if (res?.error) {
          this.errorMsg = res.error;
          this.successMsg = '';
        } else {
          this.successMsg = 'Airline added successfully';
          this.errorMsg = '';

          this.airlineCode = '';
          this.airlineName = '';
        }
        this.loading = false;

        // auto-hide toast
        setTimeout(() => {
          this.successMsg = '';
          this.errorMsg = '';
        }, 2500);
      },
      error: () => {
        this.loading = false;
        this.successMsg = '';
        this.errorMsg = 'Failed to add airline';
      }
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
