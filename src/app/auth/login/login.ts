import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { timeout } from 'rxjs/operators';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { UiIcon } from '../../shared/ui-icon/ui-icon';
import { UserRole } from '../../core/models/user.model';

// Demo-only stand-in for a real SMS OTP service, which will be wired up
// later (per the requirement: "backend API and OTP integration can be
// added later"). Every "send" is instant and always accepts this one
// fixed code — the whole point right now is proving out the customer
// UI/flow, not real SMS delivery.
const DEMO_OTP = '123456';

type CustomerStep = 'phone' | 'otp' | 'name';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, UiIcon],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login implements OnInit {

  // Admin login — unchanged, still email + password.
  email = '';
  password = '';
  showPassword = false;

  role: UserRole | '' = '';
  returnUrl: string | null = null;

  // Customer OTP flow state.
  customerStep = signal<CustomerStep>('phone');
  phone = '';
  otpDigits: string[] = ['', '', '', '', '', ''];
  newCustomerName = '';
  otpSentTo = signal('');

  // Signals: this app is zoneless (no zone.js) — state set inside a
  // .subscribe() callback MUST be a signal, or the template never
  // re-renders on it.
  isLoading = signal(false);
  errorMessage = signal('');
  emailError = signal(false);
  passwordError = signal(false);
  roleError = signal(false);
  phoneError = signal(false);
  otpError = signal(false);
  nameError = signal(false);

  roles: { value: UserRole; label: string; icon: string }[] = [
    { value: 'customer', label: 'Customer', icon: 'users' },
    { value: 'admin', label: 'Admin', icon: 'shield' }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private api: ApiService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    // Arriving here specifically to complete a customer action (Contact
    // Owner / Enquire) — default straight to the customer OTP flow rather
    // than making them pick a role first.
    if (this.route.snapshot.queryParamMap.get('intent') === 'customer') {
      this.role = 'customer';
    }
  }

  selectRole(role: UserRole): void {
    this.role = role;
    this.clearError();
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  clearError(): void {
    this.errorMessage.set('');
    this.emailError.set(false);
    this.passwordError.set(false);
    this.roleError.set(false);
    this.phoneError.set(false);
    this.otpError.set(false);
    this.nameError.set(false);
  }

  fillDemo(role: UserRole): void {
    this.role = role;
    this.email = 'admin@demo.com';
    this.password = 'demo123';
    this.clearError();
  }

  // ───────── Admin login (unchanged) ─────────

  onSubmit(): void {
    this.clearError();

    if (!this.role) {
      this.roleError.set(true);
      this.errorMessage.set('Please select a role to continue.');
      return;
    }

    if (!this.email.trim()) {
      this.emailError.set(true);
      this.errorMessage.set('Please enter your email address.');
      return;
    }

    if (!this.password.trim()) {
      this.passwordError.set(true);
      this.errorMessage.set('Please enter your password.');
      return;
    }

    const role = this.role;
    this.isLoading.set(true);

    this.api.login({ email: this.email.trim(), password: this.password.trim(), role }).pipe(timeout(15000)).subscribe({
      next: (response: any) => {
        this.isLoading.set(false);

        if (response?.Status === 200 && response?.Result) {
          this.completeLogin(response.Result);
        } else {
          this.emailError.set(true);
          this.passwordError.set(true);
          const message = response?.Result ?? 'Unable to sign in. Please try again.';
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

  // ───────── Customer OTP flow ─────────

  sendOtp(): void {
    this.clearError();
    const digits = this.phone.replace(/\D/g, '');

    if (digits.length < 10) {
      this.phoneError.set(true);
      this.errorMessage.set('Please enter a valid 10-digit phone number.');
      return;
    }

    this.phone = digits;
    this.otpSentTo.set(digits);
    this.otpDigits = ['', '', '', '', '', ''];
    this.customerStep.set('otp');
    this.toast.success(`OTP sent to +91 ${digits}`);
  }

  changeNumber(): void {
    this.customerStep.set('phone');
    this.otpDigits = ['', '', '', '', '', ''];
    this.clearError();
  }

  resendOtp(): void {
    this.otpDigits = ['', '', '', '', '', ''];
    this.toast.success(`OTP re-sent to +91 ${this.phone}`);
  }

  get otpValue(): string {
    return this.otpDigits.join('');
  }

  /** Typing a digit into one box auto-advances focus into the next box —
   * this is a plain (input)-bound field, not a signal, but that's fine:
   * native (input)/(keydown) event bindings still go through Angular's
   * event system and trigger change detection even in this zoneless app,
   * exactly like (click) or (ngSubmit) do. */
  onOtpDigit(event: Event, index: number, nextEl?: HTMLInputElement): void {
    const input = event.target as HTMLInputElement;
    const digit = input.value.replace(/\D/g, '').slice(-1);
    this.otpDigits[index] = digit;
    input.value = digit;
    this.clearError();
    if (digit && nextEl) nextEl.focus();
  }

  onOtpKeydown(event: Event, index: number, prevEl?: HTMLInputElement): void {
    if (!this.otpDigits[index] && prevEl) {
      prevEl.focus();
    }
  }

  onOtpPaste(event: ClipboardEvent, boxes: HTMLInputElement[]): void {
    const pasted = event.clipboardData?.getData('text').replace(/\D/g, '').slice(0, 6) ?? '';
    if (!pasted) return;
    event.preventDefault();
    this.otpDigits = pasted.padEnd(6, '').split('').slice(0, 6);
    this.otpDigits.forEach((d, i) => { if (boxes[i]) boxes[i].value = d; });
    const lastFilled = Math.min(pasted.length, 5);
    boxes[lastFilled]?.focus();
    this.clearError();
  }

  verifyOtp(): void {
    this.clearError();

    if (this.otpValue.length !== 6) {
      this.otpError.set(true);
      this.errorMessage.set('Please enter the 6-digit code.');
      return;
    }

    if (this.otpValue !== DEMO_OTP) {
      this.otpError.set(true);
      this.errorMessage.set(`Incorrect code. For this demo, use ${DEMO_OTP}.`);
      return;
    }

    this.isLoading.set(true);

    this.api.getAllUsers('customer').pipe(timeout(15000)).subscribe({
      next: (res: any) => {
        this.isLoading.set(false);
        const customers: any[] = (res?.Status === 200 && Array.isArray(res?.Result)) ? res.Result : [];
        const existing = customers.find(c => (c.phone ?? '').replace(/\D/g, '') === this.phone);

        if (existing) {
          this.toast.success(`Welcome back, ${existing.name ?? 'there'}!`);
          this.completeLogin(existing);
        } else {
          this.customerStep.set('name');
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Unable to connect to server. Please try again.');
      }
    });
  }

  createCustomerAccount(): void {
    this.clearError();

    if (!this.newCustomerName.trim()) {
      this.nameError.set(true);
      this.errorMessage.set('Please enter your name.');
      return;
    }

    this.isLoading.set(true);

    const data = {
      name: this.newCustomerName.trim(),
      email: `${this.phone}@otp.estatecraft.local`,
      phone: this.phone,
      password: Math.random().toString(36).slice(2, 12),
      role: 'customer'
    };

    this.api.signup(data).pipe(timeout(15000)).subscribe({
      next: (response: any) => {
        this.isLoading.set(false);

        if (response?.Status === 200 && response?.Result) {
          this.toast.success(`Welcome to Estatecraft, ${response.Result.name}!`);
          this.completeLogin(response.Result);
        } else {
          this.errorMessage.set(response?.Result ?? 'Unable to create your account. Please try again.');
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Unable to connect to server. Please try again.');
      }
    });
  }

  private completeLogin(user: any): void {
    localStorage.setItem('userId', String(user.id ?? ''));
    localStorage.setItem('userName', user.name ?? '');
    localStorage.setItem('userEmail', user.email ?? '');
    localStorage.setItem('userRole', user.role ?? '');

    if (this.returnUrl) {
      this.router.navigateByUrl(this.returnUrl);
    } else if (user.role === 'admin') {
      this.router.navigateByUrl('/app/admin');
    } else {
      this.router.navigateByUrl('/app/home');
    }
  }
}
