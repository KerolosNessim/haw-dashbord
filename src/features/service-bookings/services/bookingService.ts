import { api } from "@/lib/api";
import type { ServiceBookingsResponse, SingleBookingResponse } from "../types/index";

export const getServiceBookings = async (page: number = 1): Promise<ServiceBookingsResponse> => {
  const response = await api.get<ServiceBookingsResponse>("/v1/admin/service-bookings", {
    params: { page },
  });
  return response.data;
};

export const getServiceBookingById = async (id: number): Promise<SingleBookingResponse> => {
  const response = await api.get<SingleBookingResponse>(`/v1/admin/service-bookings/${id}`);
  return response.data;
};

export const deleteServiceBooking = async (id: number): Promise<void> => {
  await api.delete(`/v1/admin/service-bookings/${id}`);
};
