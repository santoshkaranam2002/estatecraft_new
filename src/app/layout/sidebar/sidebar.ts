import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { UiIcon } from '../../shared/ui-icon/ui-icon';

interface NavLink {
  path: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, UiIcon],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar implements OnInit {

  @Input() mobileOpen = false;
  @Output() closeMobile = new EventEmitter<void>();

  userName = '';
  userRole = '';
  links: NavLink[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.userName = localStorage.getItem('userName') ?? '';
    this.userRole = localStorage.getItem('userRole') ?? '';

    if (this.userRole === 'admin') {
      this.links = [
        { path: '/app/admin', label: 'Dashboard', icon: 'shield' },
        { path: '/app/listings', label: 'All Listings', icon: 'search' }
      ];
    } else if (this.userRole === 'customer') {
      this.links = [
        { path: '/app/home', label: 'Home', icon: 'home' },
        { path: '/app/listings', label: 'Browse', icon: 'search' },
        { path: '/app/favorites', label: 'Favourites', icon: 'heart' },
        { path: '/app/my-enquiries', label: 'My Enquiries', icon: 'mail' }
      ];
    } else {
      // Anonymous visitor — only genuinely public pages. Favourites and
      // My Enquiries both require an account, so they're hidden rather
      // than shown-then-redirected.
      this.links = [
        { path: '/app/home', label: 'Home', icon: 'home' },
        { path: '/app/listings', label: 'Browse', icon: 'search' }
      ];
    }
  }

  initials(): string {
    return this.userName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U';
  }

  logout(): void {
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    this.router.navigateByUrl('/login');
  }
}
