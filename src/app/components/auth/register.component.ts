import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl:'./register.html'
})
export class RegisterComponent {
  password = '';
  confirmPassword = '';
  fullName = '';
  email = '';
  username = '';
  role = 'ROLE_USER';
  pending = false;
  message = '';
  token: string | null = null;
  toastMessage = '';
  toastType: 'success' | 'error' | '' = '';
  toastVisible = false;
  private toastTimeout: any;
  

  constructor(public auth: AuthService, private router: Router, private cdr: ChangeDetectorRef) {}

  async submit(form: NgForm) {
    if (this.pending) return;
    if (form.invalid) {
      this.message = 'All fields are required.';
      form.control.markAllAsTouched();
      this.showToast('Please complete all fields with a valid email.', 'error');
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.message = 'Passwords do not match.';
      this.showToast('Passwords do not match.', 'error');
      return;
    }
    this.pending = true;
    this.message = '';
    this.token = null;

    try {
      const token = await firstValueFrom(
        this.auth.register({
          username: this.username,
          password: this.password,
          fullName: this.fullName,
          email: this.email,
          role: this.role
        })
      );
      this.token = token;
      console.log('Register success', { token, email: this.email, username: this.username });
      this.message = 'Registered. Redirecting...';
      this.showToast('Account created. Redirecting...', 'success');
      await this.router.navigate(['/']);
    } catch (err: any) {
      this.message = 'Registration failed.';
      this.showToast('Registration failed. Please try again.', 'error');
    } finally {
      this.pending = false;
      this.cdr.detectChanges();
    }
  }

  logout() {
    if (!confirm('Do you really want to log out?')) return;
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  private showToast(message: string, type: 'success' | 'error') {
    this.toastMessage = message;
    this.toastType = type;
    this.toastVisible = true;
    this.cdr.detectChanges();
    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.toastVisible = false;
      this.cdr.detectChanges();
      setTimeout(() => {
        this.toastMessage = '';
        this.toastType = '';
        this.cdr.detectChanges();
      }, 250);
    }, 3000);
  }
}
