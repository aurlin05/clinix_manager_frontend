// → src/app/core/services/toast.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastItem {
  id: number;
  message: string;
  title?: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private counter = 0;
  private _toasts$ = new BehaviorSubject<ToastItem[]>([]);
  readonly toasts$ = this._toasts$.asObservable();

  success(message: string, title = 'Succès')    { this.add({ message, title, type: 'success' }); }
  error(message: string, title = 'Erreur')      { this.add({ message, title, type: 'error'   }); }
  warning(message: string, title = 'Attention') { this.add({ message, title, type: 'warning' }); }
  info(message: string, title = 'Info')         { this.add({ message, title, type: 'info'    }); }

  private add(data: Omit<ToastItem, 'id'>): void {
    const id = ++this.counter;
    this._toasts$.next([...this._toasts$.value, { id, ...data }]);
    setTimeout(() => this.remove(id), 4000);
  }

  remove(id: number): void {
    this._toasts$.next(this._toasts$.value.filter(t => t.id !== id));
  }
}
