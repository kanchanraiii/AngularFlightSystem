import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl:'./add-flight.html'
})
export class AddFlightComponent {
  flightNumber = '';
  source = '';
  destination = '';

  submit() {
    console.log('Flight added:', {
      flightNumber: this.flightNumber,
      source: this.source,
      destination: this.destination
    });
  }
}
