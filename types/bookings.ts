export type BookingStatus =
  | 'pending_confirmation'
  | 'confirmed'
  | 'completed'
  | 'cancelled';

export interface BookingClient {
  uuid: string;
  name: string;
  phone: string;
}

export interface BookingCar {
  uuid: string;
  make: string;
  model: string;
  license_plate: string | { number?: string; region?: string };
  class?: string;
  generated_image?: string | null;
}

export interface BookingPost {
  uuid: string;
  orderNumber: number;
}

export interface BookingServiceItem {
  uuid: string;
  name: string;
  duration_minutes: number;
  price: number;
}

export interface BookingListItem {
  uuid: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  total_cost: number;
  client: BookingClient;
  car: BookingCar | null;
  service: BookingServiceItem;
  post: BookingPost | null;
  additionalServices?: BookingServiceItem[];
}

export interface BookingListResponse {
  data: BookingListItem[];
  total: number;
  limit: number;
  offset: number;
}

/** Detail payload from GET /api/admin/bookings/{uuid} (admin fields on nested objects). */
export interface BookingDetails {
  uuid: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  total_cost: number;
  client_comment: string | null;
  client: BookingClient;
  car: BookingCar;
  service: BookingServiceItem;
  additionalServices?: BookingServiceItem[];
  post_uuid?: string | null;
}

export interface BookingDetailsView extends BookingDetails {
  /** Passed from list item because detail DTO has post_uuid only. */
  postOrderNumber: number | null;
}

export interface ServiceCatalogItem {
  uuid: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  business_type: 'car_wash' | 'tire_service';
  service_type: 'main' | 'additional';
}

export interface BookingServiceView extends BookingServiceItem {
  description: string | null;
}
