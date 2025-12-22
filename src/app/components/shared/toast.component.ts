import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, timer } from 'rxjs';
import { ToastService, ToastMessage } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast" *ngIf="visible" [ngClass]="type">
      {{ text }}
      <button class="close" (click)="hide()">×</button>
    </div>
  `,
  styles: [
    `:host { position: fixed; top: 88px; right: 20px; z-index: 20000; pointer-events: none; }
     .toast { background: rgba(31,41,55,0.95); color: #fff; padding: 10px 14px; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.18); min-width: 220px; display: inline-flex; align-items: center; justify-content: space-between; gap: 12px; font-size: 14px; pointer-events: auto; }
     .toast.success { background: #16a34a; }
     .toast.error { background: #dc2626; }
     .toast.info { background: #2563eb; }
     .toast .close { background: transparent; border: none; color: #fff; font-size: 16px; cursor: pointer; margin-left: 12px; }
    `
  ]
})
export class ToastComponent implements OnDestroy {
  text = '';
  type: 'success' | 'error' | 'info' = 'info';
  visible = false;

  private sub: Subscription | null = null;
  private hideTimerSub: Subscription | null = null;

  constructor(private toast: ToastService) {
    this.sub = this.toast.toast$.subscribe((t: ToastMessage) => {
      this.show(t.message, t.type || 'info');
    });
  }

  show(message: string, type: 'success' | 'error' | 'info' = 'info') {
    this.text = message;
    this.type = type;
    this.visible = true;
    this.hideTimerSub?.unsubscribe();
    this.hideTimerSub = timer(3500).subscribe(() => this.hide());
  }

  hide() {
    this.visible = false;
    this.hideTimerSub?.unsubscribe();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.hideTimerSub?.unsubscribe();
  }
}
