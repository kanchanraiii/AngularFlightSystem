import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastComponent } from '../shared/toast.component';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ToastComponent],
  templateUrl: './change-password.html',
  styleUrls: ['./login.css']
})
export class ChangePasswordComponent {
  readonly authBase =
    window.location.port === '9000' ? 'http://localhost:9000/auth' : '/auth';

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  resetUsername = '';
  resetEmail = '';
  resetCode = '';
  resetNewPassword = '';
  resetConfirmPassword = '';
  resetRequested = false;

  pending = false;
  message = '';
  mode: 'change' | 'forgot' = 'change';

  constructor(
    private http: HttpClient,
    private toast: ToastService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    public auth: AuthService
  ) {}

  passwordError(): string {
    if (!this.newPassword) return 'New password is required';
    if (this.newPassword.length < 8) return 'Use at least 8 characters';
    if (!/[A-Z]/.test(this.newPassword)) return 'Add an uppercase letter';
    if (!/[a-z]/.test(this.newPassword)) return 'Add a lowercase letter';
    if (!/[0-9]/.test(this.newPassword)) return 'Add a number';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(this.newPassword)) return 'Add a special character';
    if (this.currentPassword && this.newPassword === this.currentPassword) {
      return 'New password must differ from current';
    }
    return '';
  }

  confirmError(): string {
    if (!this.confirmPassword) return 'Confirm your new password';
    if (this.newPassword && this.confirmPassword !== this.newPassword) {
      return 'Passwords do not match';
    }
    return '';
  }

  canSubmit(): boolean {
    return (
      !!this.currentPassword &&
      !this.passwordError() &&
      !this.confirmError()
    );
  }

  resetPasswordError(): string {
    if (!this.resetNewPassword) return 'New password is required';
    if (this.resetNewPassword.length < 8) return 'Use at least 8 characters';
    if (!/[A-Z]/.test(this.resetNewPassword)) return 'Add an uppercase letter';
    if (!/[a-z]/.test(this.resetNewPassword)) return 'Add a lowercase letter';
    if (!/[0-9]/.test(this.resetNewPassword)) return 'Add a number';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(this.resetNewPassword)) return 'Add a special character';
    return '';
  }

  resetConfirmError(): string {
    if (!this.resetConfirmPassword) return 'Confirm your new password';
    if (this.resetNewPassword && this.resetConfirmPassword !== this.resetNewPassword) {
      return 'Passwords do not match';
    }
    return '';
  }

  canSubmitResetConfirm(): boolean {
    return (
      !!this.resetUsername &&
      !!this.resetCode &&
      !this.resetPasswordError() &&
      !this.resetConfirmError()
    );
  }

  async submitResetRequest(form: NgForm) {
    if (this.pending) return;

    if (!this.resetUsername || !this.resetEmail) {
      this.toast.show('Enter username and email', 'error');
      return;
    }

    this.pending = true;
    this.cdr.detectChanges();
    try {
      await this.http.post(
        `${this.authBase}/password-reset/request`,
        { username: this.resetUsername, email: this.resetEmail },
        { responseType: 'text' }
      ).toPromise();
      this.toast.show('If the account exists, a code was sent.', 'success');
      this.resetRequested = true;
    } catch (err: any) {
      const msg = err?.error || 'Failed to request reset code';
      this.toast.show(msg, 'error');
    } finally {
      this.pending = false;
      this.cdr.detectChanges();
    }
  }

  async submitResetConfirm(form: NgForm) {
    if (this.pending) return;

    Object.values(form.controls).forEach((c: any) => c.control?.markAsTouched?.());

    const strengthError = this.resetPasswordError();
    const confirmError = this.resetConfirmError();
    if (!this.resetUsername || !this.resetCode || strengthError || confirmError) {
      const msg = strengthError || confirmError || 'Fill all fields';
      this.toast.show(msg, 'error');
      this.cdr.detectChanges();
      return;
    }

    this.pending = true;
    this.cdr.detectChanges();
    try {
      await this.http.post(
        `${this.authBase}/password-reset/confirm`,
        {
          username: this.resetUsername,
          code: this.resetCode,
          newPassword: this.resetNewPassword
        },
        { responseType: 'text' }
      ).toPromise();
      this.toast.show('Password updated successfully', 'success');
      this.mode = 'change';
      this.resetRequested = false;
      this.resetUsername = '';
      this.resetEmail = '';
      this.resetCode = '';
      this.resetNewPassword = '';
      this.resetConfirmPassword = '';
    } catch (err: any) {
      const msg = err?.error || 'Failed to reset password';
      this.toast.show(msg, 'error');
    } finally {
      this.pending = false;
      this.cdr.detectChanges();
    }
  }

  async submit(form: NgForm) {
    if (this.pending) return;

    Object.values(form.controls).forEach((c: any) => c.control?.markAsTouched?.());

    const strengthError = this.passwordError();
    const confirmError = this.confirmError();
    if (!this.currentPassword || strengthError || confirmError) {
      const msg = strengthError || confirmError || 'Please fill all fields';
      this.message = msg;
      this.toast.show(msg, 'error');
      this.cdr.detectChanges();
      return;
    }

    this.pending = true;
    this.message = '';
    this.cdr.detectChanges();

    try {
      await this.http.put(
        `${this.authBase}/update-password`,
        {
          oldPassword: this.currentPassword,
          newPassword: this.newPassword
        },
        { responseType: 'text' }
      ).toPromise();

      this.toast.show('Password updated successfully', 'success');
      this.currentPassword = '';
      this.newPassword = '';
      this.confirmPassword = '';
      form.resetForm();
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
}
