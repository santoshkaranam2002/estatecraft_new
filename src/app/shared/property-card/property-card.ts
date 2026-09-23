import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { Property } from '../../core/models/property.model';
import { UiIcon } from '../ui-icon/ui-icon';

@Component({
  selector: 'app-property-card',
  standalone: true,
  imports: [RouterLink, DecimalPipe, UiIcon],
  templateUrl: './property-card.html',
  styleUrl: './property-card.scss'
})
export class PropertyCardComp {

  @Input({ required: true }) property!: Property;
  @Input() compact = false;
  @Output() enquire = new EventEmitter<Property>();

  private getFavoriteIds(): number[] {
    try {
      const raw = localStorage.getItem('favoritePropertyIds');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  isFav(): boolean {
    return this.getFavoriteIds().includes(this.property.id);
  }

  toggleFav(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    const ids = this.getFavoriteIds();
    const index = ids.indexOf(this.property.id);
    if (index > -1) {
      ids.splice(index, 1);
    } else {
      ids.push(this.property.id);
    }
    localStorage.setItem('favoritePropertyIds', JSON.stringify(ids));
  }

  onEnquire(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.enquire.emit(this.property);
  }

  private categoryKeyword(): string {
    return this.property.category === 'Apartment' ? 'apartment' : 'house';
  }

  private lockFor(seed: string): number {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
    return (hash % 200) + 1;
  }

  img(w = 640, h = 480): string {
    if (this.property.images && this.property.images.length) return this.property.images[0];
    return `https://loremflickr.com/${w}/${h}/${this.categoryKeyword()}?lock=${this.lockFor(this.property.seed)}`;
  }

  price(): string {
    const n = this.property.price;
    if (n >= 10000000) return '₹' + (n / 10000000).toFixed(n % 10000000 === 0 ? 0 : 2) + ' Cr';
    if (n >= 100000) return '₹' + (n / 100000).toFixed(n % 100000 === 0 ? 0 : 2) + ' L';
    return '₹' + n.toLocaleString('en-IN');
  }
}
