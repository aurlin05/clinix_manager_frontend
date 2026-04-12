import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { slideInRight } from '../../../shared/animations/app.animations';

export interface ToastData {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
}

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './toast.html',
  styleUrls: ['./toast.scss'],
  animations: [slideInRight]
})
export class ToastComponent {
  readonly icons: Record<string, string> = {
    success: 'check_circle',
    error:   'error',
    warning: 'warning',
    info:    'info'
  };

  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public data: ToastData,
    public snackRef: MatSnackBarRef<ToastComponent>
  ) {}
}
