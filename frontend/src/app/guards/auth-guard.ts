import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

export const authGuard: CanActivateFn = () => {
   const platformId = inject(PLATFORM_ID);

   // On the server (SSR), localStorage doesn't exist.
   // Let the server-side render pass through — the browser will enforce auth.
   if (!isPlatformBrowser(platformId)) {
      return true;
   }

   const auth = inject(Auth);
   const router = inject(Router);

   if (auth.isLoggedIn()) {
      return true;
   }

   router.navigate(['/login']);
   return false;
};

