import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl:'./add-airline.html' 
})
export class AddAirlineComponent {
  name = '';

  submit() {
    console.log('Airline added:', this.name);
  }
}
