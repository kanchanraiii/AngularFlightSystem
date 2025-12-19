import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { BookingService } from '../../services/booking.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl:'./home.html'
})
export class HomeComponent implements OnInit {
  tripType: 'one-way' | 'round-trip' = 'one-way';
  from = '';
  to = '';
  departureDate = '';
  returnDate = '';
  flights: any[] = [];
  filteredFlights: any[] = [];
  sourceSuggestions: string[] = [];
  destSuggestions: string[] = [];
  loading = false;
  searchAttempted = false;
  error = '';
  toastMessage = '';
  toastType: 'success' | 'error' | '' = '';
  toastVisible = false;
  private toastTimeout: any;
  airlineMap: Record<string, string> = {};
  readonly destinations = [
    'Kanpur',
    'Lucknow',
    'Varanasi',
    'Delhi',
    'Bangalore',
    'Mumbai',
    'Chennai',
    'Hyderabad',
    'Pune',
    'Guwahati',
    'Coimbatore',
    'Mysore',
    'Kochi',
    'Srinagar'
  ];
  cityImages: Record<string, string> = {
    delhi: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    mumbai: 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?q=80&w=765&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    kochi: 'https://plus.unsplash.com/premium_photo-1697730433023-c5fcff0506ee?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    srinagar: 'https://images.unsplash.com/photo-1614591276564-7b3e69347a48?q=80&w=1174&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    bangalore: 'https://images.unsplash.com/photo-1697130383976-38f28c444292?q=80&w=1026&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    chennai: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    hyderabad: 'https://plus.unsplash.com/premium_photo-1694475128245-999b1ae8a44e?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    pune: 'https://images.unsplash.com/photo-1577195943805-d9a2f1c404bd?q=80&w=688&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    lucknow: 'https://plus.unsplash.com/premium_photo-1697730430283-7e4456c78375?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    varanasi: 'https://images.unsplash.com/photo-1561359313-0639aad49ca6?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    kanpur: 'https://plus.unsplash.com/premium_photo-1661963385126-11fa577925d3?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    guwahati: 'https://images.unsplash.com/photo-1632914697578-16d806df6a1b?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    coimbatore: 'https://images.unsplash.com/photo-1561006289-4fe1a09bf743?q=80&w=1760&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    mysore: 'https://images.unsplash.com/photo-1600112356915-089abb8fc71a?q=80&w=1294&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    default: 'https://plus.unsplash.com/premium_photo-1679830513869-cd3648acb1db?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  };

  constructor(public auth: AuthService, private router: Router, private booking: BookingService) {}

  ngOnInit() {
    this.loadFlights();
  }

  async loadFlights() {
    this.loading = true;
    this.error = '';
    try {
      const [flights, airlines] = await Promise.all([
        firstValueFrom(this.booking.getAllFlights()),
        firstValueFrom(this.booking.getAllAirlines())
      ]);
      this.flights = Array.isArray(flights) ? flights : [];
      this.airlineMap = {};
      (Array.isArray(airlines) ? airlines : []).forEach((a: any) => {
        if (a?.airlineCode && a?.airlineName) {
          this.airlineMap[(a.airlineCode as string).toLowerCase()] = a.airlineName as string;
        }
      });
    } catch (err) {
      this.error = 'Failed to load flights.';
      this.flights = [];
      this.airlineMap = {};
    } finally {
      this.loading = false;
    }
  }

  setTripType(type: 'one-way' | 'round-trip') {
    this.tripType = type;
    this.filteredFlights = [];
    this.searchAttempted = false;
    if (type === 'one-way') {
      this.returnDate = '';
    }
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  onSourceInput() {
    this.sourceSuggestions = this.buildSuggestions(this.from);
  }

  onDestInput() {
    this.destSuggestions = this.buildSuggestions(this.to);
  }

  buildSuggestions(query: string) {
    const q = (query || '').trim().toLowerCase();
    if (!q) return [];
    const cities = new Set<string>();
    this.flights.forEach((f) => {
      if (f.sourceCity && f.sourceCity.toLowerCase().includes(q)) cities.add(f.sourceCity);
      if (f.destinationCity && f.destinationCity.toLowerCase().includes(q)) cities.add(f.destinationCity);
    });
    return Array.from(cities).slice(0, 5);
  }

  selectSource(city: string) {
    this.from = city;
    this.sourceSuggestions = [];
  }

  selectDest(city: string) {
    this.to = city;
    this.destSuggestions = [];
  }

  imageFor(city?: string) {
    if (!city) return this.cityImages['default'];
    const key = city.toLowerCase();
    return this.cityImages[key] || this.cityImages['default'];
  }

  get availableCities(): string[] {
    return this.destinations;
  }

  setCity(city: string, mode: 'from' | 'to') {
    if (mode === 'from') {
      this.from = city;
    } else {
      this.to = city;
    }
    this.searchAttempted = false;
    this.filteredFlights = [];
    this.showToast(`${mode === 'from' ? 'Source' : 'Destination'} set to ${city}.`, 'success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  airlineFor(f: any) {
    if (f.airlineName) return f.airlineName;
    const code = (f.airlineCode || f.flightNumber || '').toString().toLowerCase();
    return this.airlineMap[code] || f.airlineCode || f.flightNumber || '—';
  }

  search() {
    this.sourceSuggestions = [];
    this.destSuggestions = [];
    const fromTrim = (this.from || '').trim();
    const toTrim = (this.to || '').trim();

    const missingBase = !fromTrim || !toTrim || !this.departureDate;
    const missingReturn = this.tripType === 'round-trip' && !this.returnDate;

    if (missingBase || missingReturn) {
      this.filteredFlights = [];
      this.searchAttempted = false;
      this.showToast('Please fill From, To, and all required dates.', 'error');
      return;
    }

    if (fromTrim.toLowerCase() === toTrim.toLowerCase()) {
      this.filteredFlights = [];
      this.searchAttempted = false;
      this.showToast('Source and destination cannot be the same.', 'error');
      return;
    }

    this.from = fromTrim;
    this.to = toTrim;
    this.searchAttempted = true;

    const fromLower = fromTrim.toLowerCase();
    const toLower = toTrim.toLowerCase();
    this.filteredFlights = this.flights.filter((f) => {
      const src = (f.sourceCity || '').toLowerCase();
      const dst = (f.destinationCity || '').toLowerCase();
      const dateMatch = this.departureDate ? f.departureDate === this.departureDate : true;
      return src.includes(fromLower) && dst.includes(toLower) && dateMatch;
    });
  }

  private showToast(message: string, type: 'success' | 'error') {
    this.toastMessage = message;
    this.toastType = type;
    this.toastVisible = true;
    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.toastVisible = false;
      setTimeout(() => {
        this.toastMessage = '';
        this.toastType = '';
      }, 250);
    }, 3000);
  }
}
