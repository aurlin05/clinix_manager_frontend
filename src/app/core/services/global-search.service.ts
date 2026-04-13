// → src/app/core/services/global-search.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GlobalSearchService {
  private _term$ = new BehaviorSubject<string>('');
  readonly term$ = this._term$.asObservable();

  setTerm(term: string): void { this._term$.next(term); }
  reset(): void { this._term$.next(''); }
  get currentTerm(): string { return this._term$.value; }
}
