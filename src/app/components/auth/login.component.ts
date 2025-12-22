import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { firstValueFrom } from 'rxjs';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class LoginComponent {
  email = '';
  username = '';
  password = '';
  pending = false;
  message = '';
  token: string | null = null;

  toastMessage = '';
  toastType: 'success' | 'error' | '' = '';
  toastVisible = false;

  confirmLogout = false;
  private confirmCallback: (() => void) | null = null;

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
      this.showToast('Logged in successfully', 'success');
      this.cdr.detectChanges();

      if (this.auth.isAdmin()) {
        await this.router.navigate(['/admin']);
      } else {
        await this.router.navigate(['/']);
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
    this.showConfirmToast('Do you really want to log out?', () => {
      this.auth.logout();
      this.router.navigate(['/login']);
    });
  }

  private showToast(message: string, type: 'success' | 'error') {
    clearTimeout(this.toastTimeout);
    this.toastMessage = message;
    this.toastType = type;
    this.toastVisible = true;
    this.confirmLogout = false;
    this.cdr.detectChanges();

    this.toastTimeout = setTimeout(() => {
      this.resetToast();
    }, 3000);
  }

  private showConfirmToast(message: string, onConfirm: () => void) {
    clearTimeout(this.toastTimeout);
    this.toastType = '';
    this.toastVisible = true;
    this.confirmLogout = true;
    this.confirmCallback = onConfirm;
    this.cdr.detectChanges();
  }

  confirmYes() {
    if (this.confirmCallback) {
      this.confirmCallback();
    }
    this.resetToast();
  }

  confirmNo() {
    this.resetToast();
  }

  private resetToast() {
    clearTimeout(this.toastTimeout);
    this.toastVisible = false;
    this.confirmLogout = false;
    this.confirmCallback = null;
    this.toastMessage = '';
    this.toastType = '';
    this.cdr.detectChanges();
  }
  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
