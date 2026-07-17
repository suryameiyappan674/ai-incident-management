import { CanActivateFn,Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  
 const router = inject(Router);
if(localStorage!=undefined){
const token = localStorage.getItem('token');
 if (!token) {
    router.navigate(['/login']);
    return false;
  }
 
}
   return true;
};
