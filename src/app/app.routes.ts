import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login.component';
import { RegisterComponent } from './components/auth/register.component';
import { HomeComponent } from './components/home/home.component';
import { HistoryComponent } from './components/history/history.component';
import { authGuard } from './auth/auth.guard';
import { BookingComponent } from './components/booking/bookflight.component';
import { adminGuard } from './auth/admin.guard';
import { AdminLoginComponent } from './components/auth/admin-login.component';
import { ChangePasswordComponent } from './components/auth/change-password.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'admin-login', component: AdminLoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'history', component: HistoryComponent, canActivate: [authGuard] },
  { path: 'book-flight', component: BookingComponent, canActivate: [authGuard] },
  { path: 'change-password', component: ChangePasswordComponent, canActivate: [authGuard] },
  {
    path: 'admin',
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./components/admin/admin-dashboard.component')
            .then(m => m.AdminDashboardComponent)
      },
      {
        path: 'add-airline',
        loadComponent: () =>
          import('./components/admin/add-airline.component')
            .then(m => m.AddAirlineComponent)
      },
      {
        path: 'add-flight',
        loadComponent: () =>
          import('./components/admin/add-flight.component')
            .then(m => m.AddFlightComponent)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
