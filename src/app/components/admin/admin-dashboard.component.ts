import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-admin-dashboard',
  imports: [RouterModule],
  template: `
    <h2>Admin Dashboard</h2>

    <div style="margin-top: 16px">
      <button routerLink="add-airline">Add Airline</button>
      <button routerLink="add-flight" style="margin-left: 10px">
        Add Flight
      </button>
    </div>

    <hr style="margin: 20px 0" />

    <router-outlet></router-outlet>
  `
})
export class AdminDashboardComponent {}
