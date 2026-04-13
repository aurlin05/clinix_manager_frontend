// → src/app/shared/components/toast/toast-container.ts
import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import { ToastService, ToastItem } from '../../../core/services/toast.service';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="toast-container">
      <div *ngFor="let t of toasts; trackBy: trackById"
        class="toast" [class]="'toast-' + t.type"
        (click)="remove(t.id)">
        <div class="toast-icon-wrap">
          <mat-icon style="font-size:20px;width:20px;height:20px;line-height:20px">{{ icons[t.type] }}</mat-icon>
        </div>
        <div class="toast-body">
          <p class="toast-title" *ngIf="t.title">{{ t.title }}</p>
          <p class="toast-msg">{{ t.message }}</p>
        </div>
        <button class="toast-x" (click)="remove(t.id)">
          <mat-icon style="font-size:15px;width:15px;height:15px;line-height:15px">close</mat-icon>
        </button>
        <div class="toast-bar" [class]="'toast-bar-' + t.type"></div>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 99999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    }

    .toast {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 13px 14px;
      border-radius: 14px;
      min-width: 300px;
      max-width: 420px;
      border-left: 4px solid;
      box-shadow: 0 8px 30px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06);
      position: relative;
      overflow: hidden;
      cursor: pointer;
      pointer-events: all;
      animation: slideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
    }

    @keyframes slideIn {
      from { transform: translateX(110%); opacity: 0; }
      to   { transform: translateX(0);    opacity: 1; }
    }

    .toast-success { background: #f0fdf4; border-left-color: #10B981; }
    .toast-error   { background: #fff1f2; border-left-color: #EF4444; }
    .toast-warning { background: #fffbeb; border-left-color: #F59E0B; }
    .toast-info    { background: #eff6ff; border-left-color: #3B82F6; }

    .toast-icon-wrap {
      width: 36px; height: 36px; border-radius: 9px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .toast-success .toast-icon-wrap { background: rgba(16,185,129,0.12); color: #10B981; }
    .toast-error   .toast-icon-wrap { background: rgba(239,68,68,0.12);  color: #EF4444; }
    .toast-warning .toast-icon-wrap { background: rgba(245,158,11,0.12); color: #F59E0B; }
    .toast-info    .toast-icon-wrap { background: rgba(59,130,246,0.12); color: #3B82F6; }

    .toast-body { flex: 1; min-width: 0; }

    .toast-title {
      font-size: 13px; font-weight: 700; margin: 0 0 2px;
      line-height: 1.3;
    }
    .toast-success .toast-title { color: #065F46; }
    .toast-error   .toast-title { color: #991B1B; }
    .toast-warning .toast-title { color: #92400E; }
    .toast-info    .toast-title { color: #1E40AF; }

    .toast-msg {
      font-size: 13px; color: #374151; margin: 0; line-height: 1.4;
    }

    .toast-x {
      background: none; border: none; padding: 4px; cursor: pointer;
      color: #9CA3AF; border-radius: 6px;
      display: flex; align-items: center; flex-shrink: 0;
      transition: all 0.15s ease;
    }
    .toast-x:hover { background: rgba(0,0,0,0.06); color: #374151; }

    .toast-bar {
      position: absolute; bottom: 0; left: 0;
      height: 3px; width: 100%;
      animation: shrink 4s linear forwards;
    }
    .toast-bar-success { background: #10B981; }
    .toast-bar-error   { background: #EF4444; }
    .toast-bar-warning { background: #F59E0B; }
    .toast-bar-info    { background: #3B82F6; }

    @keyframes shrink {
      from { width: 100%; }
      to   { width: 0%; }
    }
  `]
})
export class ToastContainerComponent implements OnInit, OnDestroy {
  toasts: ToastItem[] = [];

  readonly icons: Record<string, string> = {
    success: 'check_circle',
    error:   'error',
    warning: 'warning',
    info:    'info'
  };

  private sub!: Subscription;

  constructor(private toastService: ToastService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.sub = this.toastService.toasts$.subscribe(toasts => {
      this.toasts = toasts;
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  remove(id: number): void {
    this.toastService.remove(id);
  }

  trackById(_: number, t: ToastItem): number { return t.id; }
}
