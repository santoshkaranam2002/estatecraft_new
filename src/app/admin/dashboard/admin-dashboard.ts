import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { timeout } from 'rxjs/operators';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Property, Enquiry, PropertyCategory, Furnishing } from '../../core/models/property.model';
import { UiIcon } from '../../shared/ui-icon/ui-icon';

interface CategoryCount { label: string; count: number; }

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  createdDate: string;
}

const AMENITY_LIST = ['Power Backup', '24x7 Security', 'Covered Parking', 'Lift', 'Wi-Fi Ready', 'Housekeeping', 'Water Softener', 'Garden'];

const CATEGORY_OPTIONS: { value: PropertyCategory; label: string }[] = [
  { value: 'House', label: 'Independent House' },
  { value: 'Apartment', label: 'Apartment' }
];

type NewPropertyForm = {
  title: string; category: PropertyCategory;
  price: number | null; priceUnit: string; location: string; city: string;
  area: number | null; beds: number | null; baths: number | null; floor: string;
  furnishing: Furnishing; description: string; amenities: string[];
  latitude: number | null; longitude: number | null;
};

function emptyForm(): NewPropertyForm {
  return {
    title: '', category: 'House', price: null, priceUnit: '/month',
    location: '', city: '', area: null, beds: null, baths: null, floor: '',
    furnishing: 'Unfurnished', description: '', amenities: [],
    latitude: null, longitude: null
  };
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [FormsModule, UiIcon],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss'
})
export class AdminDashboard implements OnInit {

  activeTab = signal<'properties' | 'overview' | 'enquiries' | 'customers'>('properties');

  // Signals: state set inside .subscribe() callbacks needs to be a signal
  // in this zoneless app, or the page never repaints when data arrives.
  properties = signal<Property[]>([]);
  enquiries = signal<Enquiry[]>([]);
  customers = signal<Customer[]>([]);
  loading = signal(true);
  loadError = signal(false);
  customersLoading = signal(true);

  pending = computed(() => this.properties().filter(p => !p.approved));
  approvedProperties = computed(() => this.properties().filter(p => p.approved));

  // Add Property form state.
  ownerId = 0;
  categories = CATEGORY_OPTIONS;
  furnishings: Furnishing[] = ['Unfurnished', 'Semi-Furnished', 'Fully-Furnished'];
  amenityList = AMENITY_LIST;
  showAddModal = signal(false);
  form = signal<NewPropertyForm>(emptyForm());

  // Multi-image upload: every photo the admin has picked (rooms, exterior,
  // etc.), plus a matching data-URL preview for each so they can see what
  // they're about to upload and remove any one of them before submitting.
  selectedImageFiles = signal<File[]>([]);
  imagePreviewUrls = signal<string[]>([]);

  // Enquiry status pipeline admin can move a lead through directly —
  // there's no "assign to agent" step anymore, admin handles it themselves.
  statusPipeline: Enquiry['status'][] = ['New', 'Contacted', 'Interested', 'Visit Scheduled', 'Completed', 'Closed'];

  constructor(private api: ApiService, private toast: ToastService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    const rawId = localStorage.getItem('userId');
    this.ownerId = rawId ? Number(rawId) : 0;

    this.getAllProperties();
    this.getAllEnquiries();
    this.getAllCustomers();

    this.route.queryParamMap.subscribe(params => {
      if (params.get('add')) this.showAddModal.set(true);
    });
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

  getAllEnquiries(): void {
    this.api.getAllEnquiries().pipe(timeout(15000)).subscribe({
      next: (res: any) => {
        this.enquiries.set((res?.Status === 200 && Array.isArray(res?.Result)) ? res.Result : []);
        if (res?.Status !== 200) console.error('Get All Enquiries Error:', res?.Result);
      },
      error: (err: any) => {
        console.error('Get All Enquiries Error:', err);
        this.enquiries.set([]);
      }
    });
  }

  slug(status: string): string {
    return status.replace(/\s+/g, '');
  }

  nextStatuses(current: Enquiry['status']): Enquiry['status'][] {
    const idx = this.statusPipeline.indexOf(current);
    return idx === -1 ? this.statusPipeline : this.statusPipeline.slice(idx + 1);
  }

  updateEnquiryStatus(enquiry: Enquiry, status: string): void {
    if (!status) return;
    this.api.updateEnquiry(enquiry.id, { status }).pipe(timeout(15000)).subscribe({
      next: (res: any) => {
        if (res?.Status === 200 && res?.Result && typeof res.Result === 'object') {
          this.enquiries.update(list => list.map(e => e.id === enquiry.id ? res.Result : e));
          this.toast.success(`Marked as ${status}.`);
        } else {
          console.error('Update Enquiry Error:', res?.Result);
          this.toast.error('Could not update this enquiry.');
        }
      },
      error: (err: any) => {
        console.error('Update Enquiry Error:', err);
        this.toast.error('Could not update this enquiry.');
      }
    });
  }

  houseCount(): number {
    return this.properties().filter(p => p.category === 'House').length;
  }

  apartmentCount(): number {
    return this.properties().filter(p => p.category === 'Apartment').length;
  }

  availableCount(): number {
    return this.properties().filter(p => p.status === 'Available').length;
  }

  categoryBreakdown(): CategoryCount[] {
    return CATEGORY_OPTIONS.map(c => ({ label: c.label, count: this.properties().filter(p => p.category === c.value).length }));
  }

  maxCategoryCount(): number {
    return Math.max(...this.categoryBreakdown().map(c => c.count), 1);
  }

  recentListings(): Property[] {
    return this.properties().slice(-4).reverse();
  }

  getAllCustomers(): void {
    this.customersLoading.set(true);

    this.api.getAllUsers('customer').pipe(timeout(15000)).subscribe({
      next: (res: any) => {
        this.customers.set((res?.Status === 200 && Array.isArray(res?.Result)) ? res.Result : []);
        this.customersLoading.set(false);
        if (res?.Status !== 200) console.error('Get All Customers Error:', res?.Result);
      },
      error: (err: any) => {
        console.error('Get All Customers Error:', err);
        this.customers.set([]);
        this.customersLoading.set(false);
      }
    });
  }

  deleteCustomer(customer: Customer): void {
    this.api.deleteUser(customer.id).pipe(timeout(15000)).subscribe({
      next: () => {
        this.customers.update(list => list.filter(c => c.id !== customer.id));
        this.toast.success(`${customer.name} removed.`);
      },
      error: (err: any) => {
        console.error('Delete Customer Error:', err);
        this.toast.error('Could not remove this customer.');
      }
    });
  }

  toggleFeatured(property: Property): void {
    if (!property.approved) {
      this.toast.error('Approve this listing before featuring it.');
      return;
    }

    this.api.updateProperty(property.id, { featured: !property.featured }).pipe(timeout(15000)).subscribe({
      next: (res: any) => {
        if (res?.Status === 200 && res?.Result && typeof res.Result === 'object') {
          this.properties.update(list => list.map(p => p.id === property.id ? res.Result : p));
          this.toast.success(res.Result.featured ? `${property.title} is now featured.` : `${property.title} removed from featured.`);
        } else {
          console.error('Toggle Featured Error:', res?.Result);
          this.toast.error('Could not update featured status.');
        }
      },
      error: (err: any) => {
        console.error('Toggle Featured Error:', err);
        this.toast.error('Could not update featured status.');
      }
    });
  }

  deletePropertyAsAdmin(property: Property): void {
    this.api.deleteProperty(property.id).pipe(timeout(15000)).subscribe({
      next: () => {
        this.properties.update(list => list.filter(p => p.id !== property.id));
        this.toast.success(`${property.title} removed.`);
      },
      error: (err: any) => {
        console.error('Delete Property Error:', err);
        this.toast.error('Could not remove this property.');
      }
    });
  }

  approve(id: number): void {
    this.api.updateProperty(id, { approved: true }).pipe(timeout(15000)).subscribe({
      next: (res: any) => {
        if (res?.Status === 200 && res?.Result && typeof res.Result === 'object') {
          this.properties.update(list => list.map(p => p.id === id ? res.Result : p));
          this.toast.success('Listing approved and published.');
        } else {
          console.error('Approve Property Error:', res?.Result);
          this.toast.error('Could not approve the listing.');
        }
      },
      error: (err: any) => {
        console.error('Approve Property Error:', err);
        this.toast.error('Could not approve the listing.');
      }
    });
  }

  reject(id: number): void {
    this.api.deleteProperty(id).pipe(timeout(15000)).subscribe({
      next: () => {
        this.properties.update(list => list.filter(p => p.id !== id));
        this.toast.error('Listing rejected and removed.');
      },
      error: (err: any) => {
        console.error('Reject Property Error:', err);
        this.toast.error('Could not reject the listing.');
      }
    });
  }

  imageUrl(seed: string): string {
    return `https://loremflickr.com/140/100/house?lock=${this.lockFor(seed)}`;
  }

  private lockFor(seed: string): number {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
    return (hash % 200) + 1;
  }

  formatPrice(n: number): string {
    if (n >= 100000) return '₹' + (n / 100000).toFixed(n % 100000 === 0 ? 0 : 2) + ' L';
    return '₹' + n.toLocaleString('en-IN');
  }

  // ───────── Add Property (now the admin's own action, not an agent's) ─────────

  toggleAmenity(a: string): void {
    this.form.update(f => {
      const has = f.amenities.includes(a);
      return { ...f, amenities: has ? f.amenities.filter(x => x !== a) : [...f.amenities, a] };
    });
  }

  openAdd(): void {
    this.form.set(emptyForm());
    this.selectedImageFiles.set([]);
    this.imagePreviewUrls.set([]);
    this.showAddModal.set(true);
  }

  closeAdd(): void {
    this.showAddModal.set(false);
    this.selectedImageFiles.set([]);
    this.imagePreviewUrls.set([]);
  }

  /** Handles selecting multiple photos at once (rooms, exterior, etc.) —
   * every valid image file picked gets appended to the running list, with
   * a live preview generated for each, rather than replacing what was
   * already selected. */
  onImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];
    if (!files.length) return;

    const validFiles = files.filter(f => f.type.startsWith('image/'));
    if (validFiles.length !== files.length) {
      this.toast.error('Some files were skipped — only image files are allowed.');
    }

    this.selectedImageFiles.update(list => [...list, ...validFiles]);

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviewUrls.update(list => [...list, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    input.value = '';
  }

  removeSelectedImage(index: number): void {
    this.selectedImageFiles.update(list => list.filter((_, i) => i !== index));
    this.imagePreviewUrls.update(list => list.filter((_, i) => i !== index));
  }

  submitProperty(): void {
    const f = this.form();
    if (!f.title.trim()) { this.toast.error('Please enter a property title.'); return; }

    const fields = {
      title: f.title.trim(),
      category: f.category,
      price: f.price ?? 0,
      priceUnit: f.priceUnit,
      location: f.location.trim() || '—',
      city: f.city.trim() || '—',
      beds: f.beds ?? 0,
      baths: f.baths ?? 0,
      area: f.area ?? 0,
      floor: f.floor.trim() || '—',
      furnishing: f.furnishing,
      amenities: f.amenities,
      ownerId: this.ownerId,
      // Admin adding a property IS the approval — it goes straight to
      // customers, no separate review queue needed.
      approved: true,
      description: f.description.trim() || 'No description provided yet.'
    };

    // property_create only accepts multipart/form-data — always send
    // FormData. Every selected photo is appended under the SAME 'images'
    // key, which is how the backend's request.FILES.getlist('images')
    // collects them all as one list.
    const formData = new FormData();
    Object.entries(fields).forEach(([key, value]) => {
      if (key === 'amenities') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    });
    // Optional GPS pin — only sent if the admin actually filled it in.
    // An empty string would fail backend validation (a float field can't
    // parse ""), so we simply omit the key entirely when left blank.
    if (f.latitude !== null) formData.append('latitude', String(f.latitude));
    if (f.longitude !== null) formData.append('longitude', String(f.longitude));
    this.selectedImageFiles().forEach(file => formData.append('images', file));

    this.api.addProperty(formData).pipe(timeout(15000)).subscribe({
      next: (res: any) => {
        if (res?.Status === 200 && res?.Result && typeof res.Result === 'object') {
          this.properties.update(list => [...list, res.Result]);
          this.showAddModal.set(false);
          this.selectedImageFiles.set([]);
          this.imagePreviewUrls.set([]);
          this.toast.success('Property added and published.');
        } else {
          console.error('Add Property Error:', res?.Result);
          this.toast.error('Could not add the property. Please try again.');
        }
      },
      error: (err: any) => {
        console.error('Add Property Error:', err);
        this.toast.error('Could not add the property. Please try again.');
      }
    });
  }
}
