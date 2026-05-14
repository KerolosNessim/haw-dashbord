export interface ServiceBooking {
  id: number;
  service_id: number;
  service: {
    id: number;
    title: {
      ar: string;
      en: string;
    };
  };
  name: string;
  email: string;
  phone: string;
  message: string;
  status: string;
  created_at: string;
}

export interface ServiceBookingsResponse {
  status: string;
  message: string;
  data: {
    data: ServiceBooking[];
    meta: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export interface SingleBookingResponse {
  status: string;
  message: string;
  data: ServiceBooking;
}
