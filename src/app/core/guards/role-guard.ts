// → src/app/core/guards/role-guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export function roleGuard(allowedRoles: string[]): CanActivateFn {
  return () => {
    const auth   = inject(AuthService);
    const router = inject(Router);
    const user   = auth.currentUser$.value;
    if (user && allowedRoles.includes(user.role)) return true;
    router.navigate(['/dashboard']);
    return false;
  };
}
