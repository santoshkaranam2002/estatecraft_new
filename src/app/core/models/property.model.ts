export type PropertyCategory = 'House' | 'Apartment';
export type ListingType = 'Rent';
export type PropertyStatus = 'Available' | 'Rented';
export type Furnishing = 'Unfurnished' | 'Semi-Furnished' | 'Fully-Furnished' | '—';

export interface Property {
  id: number;
  title: string;
  category: PropertyCategory;
  listingType: ListingType;
  price: number;
  priceUnit: string;
  location: string;
  city: string;
  beds: number;
  baths: number;
  area: number;
  floor: string;
  furnishing: Furnishing;
  amenities: string[];
  status: PropertyStatus;
  approved: boolean;
  featured: boolean;
  ownerId: number;
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
  seed: string;
  description: string;
  /** Every uploaded photo (rooms, exterior, etc.) as absolute URLs — empty
   * array if none were uploaded, in which case the frontend falls back to
   * a generated placeholder photo (see property-card.ts / property-details.ts). */
  images: string[];
  /** Exact GPS pin, entered by Admin when adding the property (e.g.
   * copied from a Google Maps right-click) — null if not set, in which
   * case the "View on Google Maps" link falls back to a text search
   * using location/city instead of an exact pin. */
  latitude?: number | null;
  longitude?: number | null;
}

export type EnquiryStatus = 'New' | 'Contacted' | 'Interested' | 'Visit Scheduled' | 'Completed' | 'Closed';

export interface Enquiry {
  id: number;
  propertyId: number;
  customerId?: number | null;
  name: string;
  phone: string;
  message: string;
  date: string;
  status: EnquiryStatus;
  propertyTitle?: string;
  propertySeed?: string;
}

export interface PropertyFilters {
  q: string;
  category: string;
  city: string;
  /** The specific area/neighbourhood within the selected city — options
   * are derived from properties' `location` field once a city is picked. */
  area: string;
  minPrice: string;
  maxPrice: string;
  beds: string;
  furnishing: string;
  sort: string;
}
