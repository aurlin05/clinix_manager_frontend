// → src/app/shared/components/search-bar/search-bar.ts
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatButtonModule],
  templateUrl: './search-bar.html',
  styleUrls: ['./search-bar.scss']
})
export class SearchBarComponent implements OnInit, OnDestroy {
  @Output() searchTerm = new EventEmitter<string>();
  searchControl = new FormControl('');
  private destroy$ = new Subject<void>();

  /** Sync value from parent (e.g. global search) without re-emitting */
  @Input() set term(v: string) {
    if (v !== this.searchControl.value) {
      this.searchControl.setValue(v, { emitEvent: false });
    }
  }

  ngOnInit(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(val => this.searchTerm.emit(val ?? ''));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  clear(): void {
    this.searchControl.setValue('');
  }
}
