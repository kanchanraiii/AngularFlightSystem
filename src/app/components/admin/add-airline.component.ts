import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { RouterModule, Router } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl:'./add-airline.html' 
})
export class AddAirlineComponent {
  name = '';
  constructor(
     private auth: AuthService,
     private router: Router
  ){}

  submit() {
    console.log('Airline added:', this.name);
  }
   logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
