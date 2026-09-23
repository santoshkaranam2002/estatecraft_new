import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { timeout } from 'rxjs/operators';
import { ApiService } from '../../services/api.service';
import { Property } from '../../core/models/property.model';
import { PropertyCardComp } from '../../shared/property-card/property-card';
import { EnquiryModal } from '../../shared/enquiry-modal/enquiry-modal';
import { UiIcon } from '../../shared/ui-icon/ui-icon';

interface CategoryTile {
  key: string;
  label: string;
  sub: string;
  icon: string;
  category: string;
}

// Only two real property types for now — "Flat" and "Apartment" are the
// same thing, so there is deliberately only ever one Apartment option
// anywhere in the app, never a separate Flat entry.
const CATEGORIES: CategoryTile[] = [
  { key: 'House', label: 'Individual House', sub: 'Standalone homes for rent', icon: 'home', category: 'House' },
  { key: 'Apartment', label: 'Apartment', sub: 'Multi-storey homes & condos for rent', icon: 'building', category: 'Apartment' }
];

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, RouterLink, PropertyCardComp, EnquiryModal, UiIcon],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {

  categories = CATEGORIES;

  // The guided "Property Type -> Area" picker. null selectedType means
  // the type-choice step is showing; picking a type reveals the area
  // grid for that type; picking an area jumps straight to the filtered
  // results on Listings.
  selectedType = signal<CategoryTile | null>(null);

  // Signals: this app is zoneless (no zone.js) — state set inside a
  // .subscribe() callback MUST be a signal, or the template never
  // re-renders on it.
  properties = signal<Property[]>([]);
  enquiryTarget = signal<Property | null>(null);
  loading = signal(true);
  loadError = signal(false);

  heroQ = '';
  heroCategory = 'all';

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit(): void {
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

  get approvedProperties(): Property[] {
    return this.properties().filter(p => p.approved);
  }

  featured(): Property[] {
    return this.approvedProperties.filter(p => p.featured).slice(0, 3);
  }

  recent(): Property[] {
    return this.approvedProperties.slice(-4).reverse();
  }

  apartmentCount(): number {
    return this.approvedProperties.filter(p => p.category === 'Apartment').length;
  }

  /** Total distinct areas across all property types currently listed —
   * used for the hero stat, derived live from data, never hardcoded. */
  areaCountTotal(): number {
    return [...new Set(this.approvedProperties.map(p => p.location))].filter(Boolean).length;
  }

  /** The real areas to show for the currently-selected type — pulled
   * live from properties' own `location` field (exactly how Listings'
   * own area filter derives its options), never a hardcoded list. Only
   * areas that actually have at least one approved listing of this type
   * show up here. */
  areasForSelectedType(): string[] {
    const type = this.selectedType();
    if (!type) return [];
    return [...new Set(
      this.approvedProperties.filter(p => p.category === type.category).map(p => p.location)
    )].filter(Boolean).sort();
  }

  /** How many currently-listed properties of this type sit in a given
   * area — shown as a small count on each area card. */
  areaCount(area: string): number {
    const type = this.selectedType();
    if (!type) return 0;
    return this.approvedProperties.filter(p => p.category === type.category && p.location === area).length;
  }

  chooseType(tile: CategoryTile): void {
    this.selectedType.set(tile);
  }

  backToTypes(): void {
    this.selectedType.set(null);
  }

  chooseArea(area: string): void {
    const type = this.selectedType();
    if (!type) return;
    // NOTE: deliberately not also filtering by city here. The area itself
    // (an exact match on `location`) is already specific enough — forcing
    // an exact city:'Visakhapatnam' match on top of it was silently
    // returning zero results whenever a property's actual `city` field
    // didn't match that precise spelling/case, even though the area
    // itself matched fine.
    this.router.navigate(['/app/listings'], {
      queryParams: { category: type.category, area }
    });
  }

  viewAllOfType(): void {
    const type = this.selectedType();
    if (!type) return;
    this.router.navigate(['/app/listings'], { queryParams: { category: type.category } });
  }

  runHeroSearch(): void {
    this.router.navigate(['/app/listings'], {
      queryParams: {
        q: this.heroQ || null,
        category: this.heroCategory
      }
    });
  }

  /** Contact/Enquire/Book are the one thing that need an account — pure
   * browsing never does. An anonymous visitor gets sent to the OTP login
   * with a returnUrl back to exactly where they were. */
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
