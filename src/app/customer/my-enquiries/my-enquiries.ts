import { Component, OnInit, signal } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Enquiry } from '../../core/models/property.model';
import { UiIcon } from '../../shared/ui-icon/ui-icon';

@Component({
  selector: 'app-my-enquiries',
  standalone: true,
  imports: [UiIcon],
  templateUrl: './my-enquiries.html',
  styleUrl: './my-enquiries.scss'
})
export class MyEnquiries implements OnInit {

  enquiries = signal<Enquiry[]>([]);
  loading = signal(true);
  loadError = signal(false);

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.getMyEnquiries();
  }

  getMyEnquiries(): void {
    this.loading.set(true);
    this.loadError.set(false);

    const userId = localStorage.getItem('userId');
    const query = userId ? `?customerId=${userId}` : '';

    this.api.getAllEnquiries(query).subscribe({
      next: (res: any) => {
        if (res?.Status === 200 && Array.isArray(res?.Result)) {
          this.enquiries.set(res.Result);
          this.loading.set(false);
        } else {
          console.error('Get My Enquiries Error:', res?.Result);
          this.enquiries.set([]);
          this.loading.set(false);
          this.loadError.set(true);
        }
      },
      error: (err: any) => {
        console.error('Get My Enquiries Error:', err);
        this.enquiries.set([]);
        this.loading.set(false);
        this.loadError.set(true);
      }
    });
  }

  propertyImg(seed: string | undefined): string {
    return `https://loremflickr.com/150/110/house?lock=${this.lockFor(seed || 'x')}`;
  }

  slug(status: string): string {
    return status.replace(/\s+/g, '');
  }

  private lockFor(seed: string): number {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
    return (hash % 200) + 1;
  }
}