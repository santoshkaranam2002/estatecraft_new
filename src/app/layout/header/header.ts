import { Component, EventEmitter, Output, OnInit, signal } from '@angular/core';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { filter } from 'rxjs/operators';
import { UiIcon } from '../../shared/ui-icon/ui-icon';

const TITLE_MAP: Record<string, [string, string]> = {
  '/app/home': ['Discover', 'Find your next property'],
  '/app/listings': ['Browse Listings', 'Search every property on the platform'],
  '/app/favorites': ['Favourites', "Properties you've saved"],
  '/app/my-enquiries': ['My Enquiries', "Track properties you've contacted"],
  '/app/admin': ['Admin Dashboard', 'Platform-wide overview & approvals']
};

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, UiIcon],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header implements OnInit {

  @Output() menuToggle = new EventEmitter<void>();

  userName = '';
  userEmail = '';
  userRole = '';
  roleMenuOpen = signal(false);
  title: [string, string] = ['Estatecraft', ''];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.userName = localStorage.getItem('userName') ?? '';
    this.userEmail = localStorage.getItem('userEmail') ?? '';
    this.userRole = localStorage.getItem('userRole') ?? '';

    this.setTitleFromUrl(this.router.url);

    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e) => {
      this.setTitleFromUrl((e as NavigationEnd).urlAfterRedirects);
      this.roleMenuOpen.set(false);
    });
  }

  private setTitleFromUrl(fullUrl: string): void {
    const url = fullUrl.split('?')[0];
    if (url.startsWith('/app/property/')) {
      this.title = ['Property Details', ''];
      return;
    }
    this.title = TITLE_MAP[url] ?? ['Estatecraft', ''];
  }

  initials(): string {
    return this.userName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U';
  }

  toggleRoleMenu(): void {
    this.roleMenuOpen.update(v => !v);
  }

  logout(): void {
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    this.router.navigateByUrl('/login');
  }
}
