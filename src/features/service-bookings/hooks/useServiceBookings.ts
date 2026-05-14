import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getServiceBookings, deleteServiceBooking } from "../services/bookingService";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export const useServiceBookings = (page: number = 1) => {
  return useQuery({
    queryKey: ["service-bookings", page],
    queryFn: () => getServiceBookings(page),
  });
};

export const useDeleteBooking = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: deleteServiceBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-bookings"] });
      toast.success(t("booking_deleted_success", "Booking deleted successfully"));
    },
    onError: () => {
      toast.error(t("booking_deleted_error", "Failed to delete booking"));
    },
  });
};
