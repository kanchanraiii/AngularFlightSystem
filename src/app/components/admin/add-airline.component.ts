import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h3>Add Airline</h3>

    <form (ngSubmit)="submit()">
      <input
        type="text"
        name="name"
        [(ngModel)]="name"
        placeholder="Airline Name"
        required
      />
      <br /><br />
      <button type="submit">Add Airline</button>
    </form>
  `
})
export class AddAirlineComponent {
  name = '';

  submit() {
    console.log('Airline added:', this.name);
  }
}
