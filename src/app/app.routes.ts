import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { Signup } from './auth/signup/signup';
import { Shell } from './layout/shell/shell';
import { roleGuard } from './core/guards/role.guard';

import { Home } from './customer/home/home';
import { Listings } from './customer/listings/listings';
import { PropertyDetails } from './customer/property-details/property-details';
import { Favorites } from './customer/favorites/favorites';
import { MyEnquiries } from './customer/my-enquiries/my-enquiries';
import { AdminDashboard } from './admin/dashboard/admin-dashboard';

export const routes: Routes = [
  // Public, Flipkart-style entry: opening the site with no path at all
  // goes straight to the customer home dashboard — never a login page.
  { path: '', redirectTo: 'app/home', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'signup', component: Signup },

  {
    path: 'app',
    component: Shell,
    // NOTE: no guard on the Shell route itself — home/listings/property
    // details must be reachable by a completely anonymous visitor. Only
    // the routes below that genuinely need an account carry their own guard.
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: Home },
      { path: 'listings', component: Listings },
      { path: 'property/:id', component: PropertyDetails },
      { path: 'favorites', component: Favorites, canActivate: [roleGuard('customer')] },
      { path: 'my-enquiries', component: MyEnquiries, canActivate: [roleGuard('customer')] },
      { path: 'admin', component: AdminDashboard, canActivate: [roleGuard('admin')] },
      { path: '**', redirectTo: 'home' }
    ]
  },

  { path: '**', redirectTo: 'app/home' }
];
