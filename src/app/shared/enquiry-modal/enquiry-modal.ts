import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Property } from '../../core/models/property.model';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { UiIcon } from '../ui-icon/ui-icon';

@Component({
  selector: 'app-enquiry-modal',
  standalone: true,
  imports: [FormsModule, UiIcon],
  templateUrl: './enquiry-modal.html',
  styleUrl: './enquiry-modal.scss'
})
export class EnquiryModal implements OnInit {

  @Input({ required: true }) property!: Property;
  @Output() closed = new EventEmitter<void>();

  name = '';
  phone = '';
  message = "I'm interested in this property — please share more details.";

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit(): void {
    this.name = localStorage.getItem('userName') ?? '';
  }

  submit(): void {
    const userRole = localStorage.getItem('userRole');
    const userId = localStorage.getItem('userId');

    const data = {
      propertyId: this.property.id,
      customerId: userRole === 'customer' && userId ? Number(userId) : null,
      name: this.name.trim() || 'Guest User',
      phone: this.phone.trim() || '—',
      message: this.message.trim() || 'Interested in this property.'
    };

    this.api.addEnquiry(data).subscribe({
      next: (res: any) => {
        if (res?.Status === 200) {
          this.toast.success('Enquiry sent — our team will contact you shortly.');
          this.closed.emit();
        } else {
          console.error('Add Enquiry Error:', res?.Result);
          this.toast.error('Could not send your enquiry. Please try again.');
        }
      },
      error: (err: any) => {
        console.error('Add Enquiry Error:', err);
        this.toast.error('Could not send your enquiry. Please try again.');
      }
    });
  }
}
