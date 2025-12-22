import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AirlineAdminService } from '../../services/airline-admin.service';
import { AuthService } from '../../services/auth.service';
import { finalize } from 'rxjs/operators';
import { ToastComponent } from '../shared/toast.component';
import { ToastService } from '../../services/toast.service';

@Component({
  standalone: true,
  selector: 'app-add-airline',
  templateUrl: './add-airline.html',
  imports: [CommonModule, FormsModule, RouterModule, ToastComponent]
})
export class AddAirlineComponent implements OnInit {

  airlineCode = '';
  airlineName = '';

  loading = false;
  successMsg = '';
  errorMsg = '';
  existingAirlines: string[] = [];

  constructor(
    private airlineService: AirlineAdminService,
    private auth: AuthService,
    private router: Router,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAirlines();
  }

  private loadAirlines() {
    this.airlineService.getAllAirlines().subscribe({
      next: (list) => {
        this.existingAirlines = Array.isArray(list)
          ? list
              .map(a => (a?.airlineCode || '').toString().toUpperCase())
              .filter(Boolean)
          : [];
      },
      error: () => {
        this.existingAirlines = [];
      }
    });
  }

  private normalizedCode(): string {
    return (this.airlineCode || '').trim().toUpperCase();
  }

  private normalizedName(): string {
    return (this.airlineName || '').trim();
  }

  codeError(): string {
    const code = this.normalizedCode();
    if (!code) return 'Airline code is required';
    if (!/^[A-Z0-9]{2,5}$/.test(code)) return 'Use 2-5 letters or numbers';
    if (this.existingAirlines.includes(code)) return 'Airline already exists';
    return '';
  }

  nameError(): string {
    const name = this.normalizedName();
    if (!name) return 'Airline name is required';
    return '';
  }

  isFormValid(): boolean {
    return !this.codeError() && !this.nameError();
  }

  submit() {
    const codeMessage = this.codeError();
    const nameMessage = this.nameError();
    if (codeMessage || nameMessage) {
      this.errorMsg = codeMessage || nameMessage;
      this.successMsg = '';
      if (codeMessage === 'Airline already exists') {
        this.toast.show(codeMessage, 'error');
      }
      return;
    }

    const payload = {
      airlineCode: this.normalizedCode(),
      airlineName: this.normalizedName()
    };
    this.loading = true;
    this.airlineService
      .addAirline(payload)
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (res) => {
          if (res?.error) {
            this.errorMsg = res.error;
            this.successMsg = '';
            this.toast.show(this.errorMsg, 'error');
          } else {
            this.successMsg = 'Airline added successfully.';
            this.errorMsg = '';
            this.toast.show(this.successMsg, 'success');

            if (!this.existingAirlines.includes(payload.airlineCode)) {
              this.existingAirlines.push(payload.airlineCode);
            }

            this.airlineCode = '';
            this.airlineName = '';
          }

          this.loading = false;
          this.cdr.detectChanges();

          setTimeout(() => {
            this.successMsg = '';
            this.errorMsg = '';
          }, 2500);
        },
        error: () => {
          this.successMsg = '';
          this.errorMsg = 'Failed to add airline';
          this.toast.show(this.errorMsg, 'error');
          this.loading = false;
          this.cdr.detectChanges();

          setTimeout(() => {
            this.errorMsg = '';
          }, 2500);
        }
      });
  }

  logout() {
    if (!confirm('Do you really want to log out?')) return;
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
