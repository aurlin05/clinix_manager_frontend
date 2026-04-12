// → src/app/shared/components/confirm-dialog/confirm-dialog.ts
import { Component, Inject } from '@angular/core';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { scaleIn } from '../../../shared/animations/app.animations';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: 'warning' | 'danger' | 'info' | 'success';
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './confirm-dialog.html',
  styleUrls: ['./confirm-dialog.scss'],
  animations: [scaleIn]
})
export class ConfirmDialogComponent {
  readonly icons: Record<string, string> = {
    warning: 'warning_amber',
    danger:  'delete_forever',
    info:    'info',
    success: 'check_circle'
  };

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {
    if (!this.data.type) this.data.type = 'warning';
  }
}
