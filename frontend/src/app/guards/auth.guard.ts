import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

export const authGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // When running on the Server during pre-rendering/SSR, allow the guard.
  // The actual authentication validation runs on the browser Client-side.
  if (isPlatformServer(platformId)) {
    return true;
  }

  if (auth.isLoggedIn()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
