import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (toastService.toast()) {
      <div class="toast" [class.error]="toastService.toast()!.type === 'error'">
        {{ toastService.toast()!.message }}
      </div>
    }
  `,
  styles: [`
    .toast {
      position: fixed;
      bottom: 1.5rem;
      left: 50%;
      transform: translateX(-50%);
      background: #1b5e20;
      color: white;
      padding: .75rem 1.5rem;
      border-radius: 8px;
      font-size: .95rem;
      z-index: 9999;
      box-shadow: 0 4px 12px rgba(0,0,0,.3);
      animation: fadeIn .2s ease;
    }
    .toast.error { background: #b71c1c; }
    @keyframes fadeIn { from { opacity: 0; transform: translateX(-50%) translateY(10px); } }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);
}
