import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
   const platformId = inject(PLATFORM_ID);
   const auth = inject(Auth);
   const router = inject(Router);
   // On the server (SSR), localStorage doesn't exist.
   // Let the server-side render pass through — the browser will enforce auth.
   if (!isPlatformBrowser(platformId)) {
      return true;
   }


   const roles = route.data['roles'];
   const userRoles: any = JSON.parse(localStorage.getItem('user') || '{}');

   if (!roles.includes(userRoles?.role?.name)) {
      router.navigate(['/login']);
      return false;
   }

   if (auth.isLoggedIn()) {
      return true;
   }

   router.navigate(['/login']);
   return false;
};

