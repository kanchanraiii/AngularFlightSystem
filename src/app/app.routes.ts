import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login.component';
import { RegisterComponent } from './auth/register.component';
import { authGuard } from './auth/auth.guard';
import { ProtectedComponent } from './protected.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'protected', component: ProtectedComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'login' }
];
