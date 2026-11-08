import { Injectable, signal } from '@angular/core';

export interface Toast {
  message: string;
  type: 'success' | 'error';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toast = signal<Toast | null>(null);

  private dismissTimer: ReturnType<typeof setTimeout> | null = null;

  show(message: string, type: 'success' | 'error' = 'success'): void {
    if (this.dismissTimer) clearTimeout(this.dismissTimer);
    this.toast.set({ message, type });
    this.dismissTimer = setTimeout(() => {
      this.toast.set(null);
      this.dismissTimer = null;
    }, 3500);
  }
}
