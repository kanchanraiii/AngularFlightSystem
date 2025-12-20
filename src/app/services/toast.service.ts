import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ToastMessage {
  message: string;
  type?: 'success' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private subject = new Subject<ToastMessage>();
  toast$ = this.subject.asObservable();

  show(message: string, type: ToastMessage['type'] = 'info') {
    this.subject.next({ message, type });
  }
}
