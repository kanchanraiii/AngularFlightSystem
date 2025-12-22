import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-login.html',
  styleUrls: ['./login.css'],
})
export class AdminLoginComponent {
  email = '';
  username = '';
  password = '';
  pending = false;
  message = '';
  token: string | null = null;

  toastMessage = '';
  toastType: 'success' | 'error' | '' = '';
  toastVisible = false;

  private toastTimeout: any;
  private readonly animationHoldMs = 1100;

  constructor(public auth: AuthService, private router: Router, private cdr: ChangeDetectorRef) {}

  async submit(form: NgForm) {
    if (this.pending) return;

    if (form.invalid) {
      this.message = 'Please enter username, valid email, and password.';
      form.control.markAllAsTouched();
      this.showToast(this.message, 'error');
      return;
    }

    this.pending = true;
    this.message = '';
    this.token = null;
    this.cdr.detectChanges();

    await this.sleep(this.animationHoldMs);

    try {
      const token = await firstValueFrom(
        this.auth.login({ username: this.username, password: this.password }, this.email)
      );

      this.token = token;
      if (this.auth.isAdmin()) {
        this.showToast('Admin login successful.', 'success');
        this.cdr.detectChanges();
        await this.router.navigate(['/admin']);
      } else {
        this.showToast('Admin access only. Try the user login instead.', 'error');
        this.auth.logout();
      }
    } catch {
      this.message = 'Login failed.';
      this.showToast('Login failed. Check your credentials.', 'error');
    } finally {
      this.pending = false;
      this.cdr.detectChanges();
    }
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  private showToast(message: string, type: 'success' | 'error') {
    clearTimeout(this.toastTimeout);
    this.toastMessage = message;
    this.toastType = type;
    this.toastVisible = true;
    this.cdr.detectChanges();

    this.toastTimeout = setTimeout(() => {
      this.resetToast();
    }, 3000);
  }

  private resetToast() {
    clearTimeout(this.toastTimeout);
    this.toastVisible = false;
    this.toastMessage = '';
    this.toastType = '';
    this.cdr.detectChanges();
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
