// → src/app/core/guards/role-guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { ToastService } from '../services/toast.service';

export function roleGuard(allowedRoles: string[]): CanActivateFn {
  return () => {
    const auth   = inject(AuthService);
    const router = inject(Router);
    const toast  = inject(ToastService);
    const user   = auth.currentUser$.value;
    if (user && allowedRoles.includes(user.role)) return true;
    toast.warning(
      "Vous n'avez pas les droits pour accéder à cette page.",
      'Accès restreint'
    );
    router.navigate(['/dashboard']);
    return false;
  };
}
