import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { timeout } from 'rxjs/operators';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { UiIcon } from '../../shared/ui-icon/ui-icon';
import { UserRole } from '../../core/models/user.model';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, RouterLink, UiIcon],
  templateUrl: './signup.html',
  styleUrl: './signup.scss'
})
export class Signup implements OnInit {

  name = '';
  email = '';
  phone = '';
  password = '';
  confirmPassword = '';
  // Customers no longer sign up here — they browse freely with no
  // account, and get one automatically the first time they verify an
  // OTP on the login page. This form now only creates admin accounts.
  readonly role: UserRole = 'admin';
  showPassword = false;

  // Signals: this app is zoneless (no zone.js) — state set inside a
  // .subscribe() callback MUST be a signal, or the template never
  // re-renders on it.
  isLoading = signal(false);
  errorMessage = signal('');
  nameError = signal(false);
  emailError = signal(false);
  phoneError = signal(false);
  passwordError = signal(false);

  constructor(private router: Router, private api: ApiService, private toast: ToastService) {}

  ngOnInit(): void {
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  clearError(): void {
    this.errorMessage.set('');
    this.nameError.set(false);
    this.emailError.set(false);
    this.phoneError.set(false);
    this.passwordError.set(false);
  }

  onSubmit(): void {
    this.clearError();

    if (!this.name.trim()) {
      this.nameError.set(true);
      this.errorMessage.set('Please enter your full name.');
      return;
    }

    if (!this.email.trim()) {
      this.emailError.set(true);
      this.errorMessage.set('Please enter your email address.');
      return;
    }

    if (!this.phone.trim()) {
      this.phoneError.set(true);
      this.errorMessage.set('Please enter your phone number.');
      return;
    }

    if (this.password.length < 6) {
      this.passwordError.set(true);
      this.errorMessage.set('Password must be at least 6 characters.');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.passwordError.set(true);
      this.errorMessage.set('Passwords do not match.');
      return;
    }

    this.isLoading.set(true);

    const data = {
      name: this.name.trim(),
      email: this.email.trim(),
      phone: this.phone.trim(),
      password: this.password,
      role: this.role
    };

    this.api.signup(data).pipe(timeout(15000)).subscribe({
      next: (response: any) => {
        this.isLoading.set(false);

        if (response?.Status === 200) {
          this.toast.success('Account created — please sign in to continue.');
          this.router.navigateByUrl('/login');
        } else {
          this.emailError.set(true);
          const message = response?.Result ?? 'Unable to create your account.';
          this.errorMessage.set(message);
          this.toast.error(message);
        }
      },
      error: (err: any) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          err?.name === 'TimeoutError'
            ? 'The server took too long to respond. Please check that the backend is running and try again.'
            : 'Unable to connect to server. Please try again.'
        );
      }
    });
  }
}
