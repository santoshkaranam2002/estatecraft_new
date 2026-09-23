import { Injectable, signal } from '@angular/core';

export interface ToastState {
  message: string;
  type: 'success' | 'error';
  visible: boolean;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  state = signal<ToastState>({ message: '', type: 'success', visible: false });
  private timer: ReturnType<typeof setTimeout> | undefined;

  show(message: string, type: 'success' | 'error' = 'success'): void {
    clearTimeout(this.timer);
    this.state.set({ message, type, visible: true });
    this.timer = setTimeout(() => {
      this.state.update(s => ({ ...s, visible: false }));
    }, 2800);
  }

  success(message: string): void { this.show(message, 'success'); }
  error(message: string): void { this.show(message, 'error'); }
}
