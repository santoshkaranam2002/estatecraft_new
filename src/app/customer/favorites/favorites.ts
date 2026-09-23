import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Property } from '../../core/models/property.model';
import { PropertyCardComp } from '../../shared/property-card/property-card';
import { UiIcon } from '../../shared/ui-icon/ui-icon';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [RouterLink, PropertyCardComp, UiIcon],
  templateUrl: './favorites.html',
  styleUrl: './favorites.scss'
})
export class Favorites implements OnInit {

  favoriteProperties = signal<Property[]>([]);
  loading = signal(true);
  loadError = signal(false);

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.getFavoriteProperties();
  }

  private getFavoriteIds(): number[] {
    try {
      const raw = localStorage.getItem('favoritePropertyIds');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  getFavoriteProperties(): void {
    const ids = this.getFavoriteIds();
    if (!ids.length) {
      this.favoriteProperties.set([]);
      this.loading.set(false);
      this.loadError.set(false);
      return;
    }

    this.loading.set(true);
    this.loadError.set(false);

    this.api.getAllProperties('?all=1').subscribe({
      next: (res: any) => {
        if (res?.Status === 200 && Array.isArray(res?.Result)) {
          const all: Property[] = res.Result;
          this.favoriteProperties.set(all.filter(p => ids.includes(p.id)));
          this.loading.set(false);
        } else {
          console.error('Get Favorites Error:', res?.Result);
          this.favoriteProperties.set([]);
          this.loading.set(false);
          this.loadError.set(true);
        }
      },
      error: (err: any) => {
        console.error('Get Favorites Error:', err);
        this.favoriteProperties.set([]);
        this.loading.set(false);
        this.loadError.set(true);
      }
    });
  }
}