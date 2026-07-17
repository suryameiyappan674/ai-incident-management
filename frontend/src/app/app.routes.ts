import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { Engineer } from './pages/engineer/engineer';
import { authGuard } from './guards/auth-guard';
import { User } from './pages/user/user';
export const routes: Routes = [
  {
    path: '',
    component: Login
  },

  {
    path: 'login',
    component: Login
  },
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard],
    data: {
      roles: ['admin']
    }


  },
  {
    path: 'engineer',
    component: Engineer,
    canActivate: [authGuard],
    data: {
      roles: ['engineer']
    }
  },
  {
    path: 'user',
    component: User,
    canActivate: [authGuard],
    data: {
      roles: ['user']
    }
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }

];