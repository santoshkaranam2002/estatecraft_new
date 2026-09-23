import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { timeout } from 'rxjs/operators';
import { ApiService } from '../../services/api.service';
import { Property, PropertyFilters } from '../../core/models/property.model';
import { PropertyCardComp } from '../../shared/property-card/property-card';
import { EnquiryModal } from '../../shared/enquiry-modal/enquiry-modal';
import { UiIcon } from '../../shared/ui-icon/ui-icon';

const DEFAULT_FILTERS: PropertyFilters = {
  q: '', category: 'all', city: 'all', area: 'all',
  minPrice: '', maxPrice: '', beds: 'any', furnishing: 'any', sort: 'featured'
};

@Component({
  selector: 'app-listings',
  standalone: true,
  imports: [FormsModule, PropertyCardComp, EnquiryModal, UiIcon],
  templateUrl: './listings.html',
  styleUrl: './listings.scss'
})
export class Listings implements OnInit {

  properties = signal<Property[]>([]);
  filters = signal<PropertyFilters>({ ...DEFAULT_FILTERS });
  enquiryTarget = signal<Property | null>(null);
  loading = signal(true);
  loadError = signal(false);

  categories: { value: string; label: string }[] = [
    { value: 'House', label: 'Individual Houses' },
    { value: 'Apartment', label: 'Apartments' }
  ];
  furnishingOptions = ['Fully-Furnished', 'Semi-Furnished', 'Unfurnished'];

  cities = computed(() => [...new Set(this.properties().map(p => p.city))].filter(Boolean).sort());

  /** Areas within the currently-selected city only — this is what makes
   * the Area dropdown cascade from the City dropdown: pick a city, and
   * this recomputes to just that city's neighbourhoods. Selecting "All
   * Cities" shows every area across the whole platform instead. */
  areasForSelectedCity = computed(() => {
    const city = this.filters().city;
    const source = city === 'all' ? this.properties() : this.properties().filter(p => p.city === city);
    return [...new Set(source.map(p => p.location))].filter(Boolean).sort();
  });

  filtered = computed(() => {
    const f = this.filters();
    let list = [...this.properties()];

    if (f.q) {
      const q = f.q.toLowerCase();
      list = list.filter(p => p.title.toLowerCase().includes(q) || p.location.toLowerCase().includes(q) || p.city.toLowerCase().includes(q));
    }
    if (f.category !== 'all') list = list.filter(p => p.category === f.category);
    if (f.city !== 'all') list = list.filter(p => p.city === f.city);
    if (f.area !== 'all') list = list.filter(p => p.location === f.area);
    if (f.minPrice) list = list.filter(p => p.price >= Number(f.minPrice));
    if (f.maxPrice) list = list.filter(p => p.price <= Number(f.maxPrice));
    if (f.beds !== 'any') list = list.filter(p => f.beds === '4' ? p.beds >= 4 : p.beds === Number(f.beds));
    if (f.furnishing !== 'any') list = list.filter(p => p.furnishing === f.furnishing);

    if (f.sort === 'priceLow') list = [...list].sort((a, b) => a.price - b.price);
    else if (f.sort === 'priceHigh') list = [...list].sort((a, b) => b.price - a.price);
    else if (f.sort === 'areaHigh') list = [...list].sort((a, b) => b.area - a.area);
    else list = [...list].sort((a, b) => (b.featured === a.featured) ? 0 : (b.featured ? 1 : -1));
    return list;
  });

  constructor(private api: ApiService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    this.filters.set({
      ...DEFAULT_FILTERS,
      q: params.get('q') ?? '',
      category: params.get('category') ?? 'all',
      city: params.get('city') ?? 'all',
      area: params.get('area') ?? 'all',
      maxPrice: params.get('maxPrice') ?? ''
    });
    this.getAllProperties();
  }

  getAllProperties(): void {
    this.loading.set(true);
    this.loadError.set(false);

    this.api.getAllProperties('?all=1').pipe(timeout(15000)).subscribe({
      next: (res: any) => {
        if (res?.Status === 200 && Array.isArray(res?.Result)) {
          this.properties.set(res.Result);
          this.loading.set(false);
        } else {
          console.error('Get All Properties Error:', res?.Result);
          this.properties.set([]);
          this.loading.set(false);
          this.loadError.set(true);
        }
      },
      error: (err: any) => {
        console.error('Get All Properties Error:', err);
        this.properties.set([]);
        this.loading.set(false);
        this.loadError.set(true);
      }
    });
  }

  setFilter(key: string, value: string): void {
    // Changing city invalidates whatever area was previously selected —
    // that area might not even exist in the new city — so reset it.
    if (key === 'city') {
      this.filters.update(f => ({ ...f, city: value, area: 'all' }));
      return;
    }
    this.filters.update(f => ({ ...f, [key]: value }));
  }

  onInputFilter(key: string, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.filters.update(f => ({ ...f, [key]: value }));
  }

  clearFilters(): void {
    this.filters.set({ ...DEFAULT_FILTERS });
  }

  openEnquiry(p: Property): void {
    if (!localStorage.getItem('userId')) {
      this.router.navigate(['/login'], { queryParams: { intent: 'customer', returnUrl: this.router.url } });
      return;
    }
    this.enquiryTarget.set(p);
  }

  closeEnquiry(): void {
    this.enquiryTarget.set(null);
  }
}
