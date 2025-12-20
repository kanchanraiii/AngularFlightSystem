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
    `:host { position: fixed; top: 16px; right: 16px; z-index: 10000; }
     .toast { background: #333; color: #fff; padding: 12px 16px; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); min-width: 180px; display: flex; align-items: center; justify-content: space-between; }
     .toast.success { background: #2e7d32; }
     .toast.error { background: #c62828; }
     .toast.info { background: #1565c0; }
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
