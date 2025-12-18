import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login.component';
import { RegisterComponent } from './components/auth/register.component';
import { HomeComponent } from './components/home/home.component';
import { HistoryComponent } from './components/history/history.component';
import { authGuard } from './auth/auth.guard';
import { BookingComponent } from './components/booking/bookflight.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'history', component: HistoryComponent, canActivate: [authGuard] },
  { path: 'book-flight', component: BookingComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
