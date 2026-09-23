import { Component, OnDestroy, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DecimalPipe, LowerCasePipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { Property } from '../../core/models/property.model';
import { PropertyCardComp } from '../../shared/property-card/property-card';
import { EnquiryModal } from '../../shared/enquiry-modal/enquiry-modal';
import { UiIcon } from '../../shared/ui-icon/ui-icon';

@Component({
  selector: 'app-property-details',
  standalone: true,
  imports: [RouterLink, DecimalPipe, LowerCasePipe, PropertyCardComp, EnquiryModal, UiIcon],
  templateUrl: './property-details.html',
  styleUrl: './property-details.scss'
})
export class PropertyDetails implements OnInit, OnDestroy {

  propertyId = 0;

  // Signals: this app runs zoneless (no zone.js), so plain fields assigned
  // inside an RxJS .subscribe() callback never trigger a repaint on their
  // own — the page would load the data correctly in the background but
  // keep showing "Loading…" until some unrelated click forced a render.
  // Signals are tracked directly by zoneless change detection.
  property = signal<Property | null>(null);
  allProperties = signal<Property[]>([]);
  showEnquiry = signal(false);
  loading = signal(true);
  loadError = signal(false);
  currentImageIndex = signal(0);

  similar = computed(() => {
    const p = this.property();
    if (!p) return [];
    return this.allProperties()
      .filter(x => x.approved && x.category === p.category && x.id !== p.id)
      .slice(0, 3);
  });

  private paramSub?: Subscription;

  constructor(private api: ApiService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    // Subscribe to paramMap instead of reading route.snapshot once: Angular
    // reuses this same component instance when navigating from one
    // /app/property/:id to another (e.g. clicking a "similar property" card
    // below), so a snapshot read in ngOnInit never sees the new id and the
    // page keeps showing the old property. paramMap fires on every such
    // navigation, so the page reloads correctly every time.
    this.paramSub = this.route.paramMap.subscribe(params => {
      this.propertyId = Number(params.get('id'));
      this.getPropertyDetails();
    });
  }

  ngOnDestroy(): void {
    this.paramSub?.unsubscribe();
  }

  getPropertyDetails(): void {
    this.loading.set(true);
    this.loadError.set(false);

    this.api.getPropertyById(this.propertyId).subscribe({
      next: (res: any) => {
        if (res?.Status === 200 && Array.isArray(res?.Result)) {
          this.property.set(res.Result.length ? res.Result[0] : null);
          this.currentImageIndex.set(0);
          this.loading.set(false);
        } else {
          console.error('Get Property Error:', res?.Result);
          this.property.set(null);
          this.loading.set(false);
          this.loadError.set(true);
        }
      },
      error: (err: any) => {
        console.error('Get Property Error:', err);
        this.property.set(null);
        this.loading.set(false);
        this.loadError.set(true);
      }
    });

    this.api.getAllProperties('?all=1').subscribe({
      next: (res: any) => {
        this.allProperties.set((res?.Status === 200 && Array.isArray(res?.Result)) ? res.Result : []);
      },
      error: () => {
        this.allProperties.set([]);
      }
    });
  }

  /** Contact/Enquire is the one thing that needs an account — viewing
   * the property never does. Sends an anonymous visitor to OTP login
   * with a returnUrl straight back to this exact property. */
  openEnquiry(): void {
    if (!localStorage.getItem('userId')) {
      this.router.navigate(['/login'], { queryParams: { intent: 'customer', returnUrl: this.router.url } });
      return;
    }
    this.showEnquiry.set(true);
  }

  agent(): { name: string; phone: string; email: string } | null {
    const p = this.property();
    if (!p) return null;
    return {
      name: p.ownerName || 'Estatecraft Admin',
      phone: p.ownerPhone || '—',
      email: p.ownerEmail || ''
    };
  }

  private getFavoriteIds(): number[] {
    try {
      const raw = localStorage.getItem('favoritePropertyIds');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  isFav(): boolean {
    const p = this.property();
    return !!p && this.getFavoriteIds().includes(p.id);
  }

  toggleFav(): void {
    const p = this.property();
    if (!p) return;
    const ids = this.getFavoriteIds();
    const index = ids.indexOf(p.id);
    if (index > -1) {
      ids.splice(index, 1);
    } else {
      ids.push(p.id);
    }
    localStorage.setItem('favoritePropertyIds', JSON.stringify(ids));
  }

  agentInitials(): string {
    const a = this.agent();
    return a ? a.name.split(' ').map(w => w[0]).join('') : '';
  }

  private categoryKeyword(): string {
    return this.property()?.category === 'Apartment' ? 'apartment' : 'house';
  }

  private lockFor(seed: string): number {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
    return (hash % 200) + 1;
  }

  /** The photo list actually shown in the gallery — every uploaded photo,
   * or a single generated placeholder if the owner hasn't uploaded any. */
  galleryImages(): string[] {
    const p = this.property();
    if (p?.images && p.images.length) return p.images;
    const seed = p?.seed ?? 'x';
    return [`https://loremflickr.com/900/700/${this.categoryKeyword()}?lock=${this.lockFor(seed)}`];
  }

  currentImage(): string {
    const images = this.galleryImages();
    return images[this.currentImageIndex()] ?? images[0];
  }

  nextImage(): void {
    const images = this.galleryImages();
    this.currentImageIndex.update(i => (i + 1) % images.length);
  }

  prevImage(): void {
    const images = this.galleryImages();
    this.currentImageIndex.update(i => (i - 1 + images.length) % images.length);
  }

  goToImage(index: number): void {
    this.currentImageIndex.set(index);
  }

  /** The actual "View on Google Maps" link — an exact pin when the
   * property has real GPS coordinates, or a text-based Maps search using
   * location/city when it doesn't. Either way this always opens real
   * Google Maps in a new tab; no API key needed since this is Google's
   * public maps-search URL scheme. */
  mapsUrl(): string {
    const p = this.property();
    if (!p) return 'https://www.google.com/maps';

    if (p.latitude != null && p.longitude != null) {
      return `https://www.google.com/maps/search/?api=1&query=${p.latitude},${p.longitude}`;
    }
    const query = encodeURIComponent(`${p.location}, ${p.city}`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  }

  formatPrice(n: number): string {
    if (n >= 10000000) return '₹' + (n / 10000000).toFixed(n % 10000000 === 0 ? 0 : 2) + ' Cr';
    if (n >= 100000) return '₹' + (n / 100000).toFixed(n % 100000 === 0 ? 0 : 2) + ' L';
    return '₹' + n.toLocaleString('en-IN');
  }
}