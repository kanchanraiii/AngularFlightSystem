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
  templateUrl:'./login.html'
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
  private toastTimeout: any;
  toastVisible = false;
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
      console.log('Login success', { token, email: this.email, username: this.username });
      this.message = 'Logged in. Redirecting...';
      this.showToast('Logged in successfully', 'success');
      this.cdr.detectChanges();
      await this.router.navigate(['/']);
    } catch (err: any) {
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

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
