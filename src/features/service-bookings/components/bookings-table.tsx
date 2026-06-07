import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Trash2, Mail, Calendar, Briefcase } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ServiceBooking } from "../types/index";
import { bookingServiceTitle } from "../services/bookingService";
import { LaravelResourcePagination } from "@/components/ui/laravel-resource-pagination";
import { useState } from "react";
import BookingDetailsDialog from "./booking-details-dialog";
import { useDeleteBooking } from "../hooks/useServiceBookings";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface BookingsTableProps {
  bookings: ServiceBooking[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  isLoading: boolean;
  onPageChange: (page: number) => void;
}

export default function BookingsTable({
  bookings,
  meta,
  isLoading,
  onPageChange,
}: BookingsTableProps) {
  const { t, i18n } = useTranslation("translation", { keyPrefix: "consultation" });
  const isRtl = i18n.language.startsWith("ar");
  const currentLang = i18n.language.startsWith("ar") ? "ar" : "en";
  const [selectedBooking, setSelectedBooking] = useState<ServiceBooking | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<number | null>(null);

  const { mutate: deleteBooking, isPending: isDeleting } = useDeleteBooking();

  const handleViewDetails = (booking: ServiceBooking) => {
    setSelectedBooking(booking);
    setIsDetailsOpen(true);
  };

  const handleDelete = (id: number) => {
    setBookingToDelete(id);
  };

  const confirmDelete = () => {
    if (bookingToDelete) {
      deleteBooking(bookingToDelete, {
        onSuccess: () => setBookingToDelete(null),
      });
    }
  };

  const paginationMeta = {
    ...meta,
    path: "",
    from: (meta.current_page - 1) * meta.per_page + 1,
    to: Math.min(meta.current_page * meta.per_page, meta.total),
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[32px] border border-border/40 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table dir={isRtl ? "rtl" : "ltr"}>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="text-start py-5 px-6 font-bold text-foreground min-w-[200px]">
                  {t("table.service")}
                </TableHead>
                <TableHead className="text-start font-bold text-foreground">
                  {t("table.client")}
                </TableHead>
                <TableHead className="text-start font-bold text-foreground">
                  {t("table.status")}
                </TableHead>
                <TableHead className="text-start font-bold text-foreground">
                  {t("table.date")}
                </TableHead>
                <TableHead className="text-start py-5 px-6 font-bold text-foreground">
                  {t("table.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <TableCell key={j} className="py-5 px-6">
                        <div className="h-8 w-full bg-muted/40 animate-pulse rounded-lg" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-20 text-center text-muted-foreground font-medium text-lg">
                    {t("no_bookings")}
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((booking) => (
                  <TableRow
                    key={booking.id}
                    className="group border-border/40 transition-colors hover:bg-muted/5 cursor-pointer"
                    onClick={() => handleViewDetails(booking)}
                  >
                    <TableCell className="py-5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0 border border-primary/10">
                          <Briefcase className="w-5 h-5" />
                        </div>
                        <span
                          className="font-bold text-gray-900 line-clamp-2 max-w-[250px]"
                          dangerouslySetInnerHTML={{
                            __html: bookingServiceTitle(booking, currentLang) || "—",
                          }}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-foreground">{booking.name}</span>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Mail className="w-3 h-3 opacity-60" />
                          {booking.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`rounded-full px-3 py-0.5 font-bold border-none ${
                          booking.status === "new"
                            ? "bg-blue-50 text-blue-600"
                            : "bg-emerald-50 text-emerald-600"
                        }`}
                      >
                        {t(`status.${booking.status}`)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs font-bold">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 opacity-50" />
                        {booking.created_at}
                      </div>
                    </TableCell>
                    <TableCell className="py-5 px-6">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-9 h-9 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/5 border border-transparent hover:border-primary/10 transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(booking);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-9 h-9 rounded-xl text-muted-foreground hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(booking.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {!isLoading && bookings.length > 0 && (
          <div className="p-6 border-t border-border/40 bg-muted/5">
            <LaravelResourcePagination
              meta={paginationMeta}
              onPageChange={onPageChange}
              isRtl={isRtl}
              previousLabel={t("pagination.previous")}
              nextLabel={t("pagination.next")}
            />
          </div>
        )}
      </div>

      <BookingDetailsDialog
        booking={selectedBooking}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />

      <AlertDialog open={bookingToDelete !== null} onOpenChange={(open) => !open && setBookingToDelete(null)}>
        <AlertDialogContent className="rounded-[32px] p-8 border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black tracking-tight">{t("delete_confirm_title")}</AlertDialogTitle>
            <AlertDialogDescription className="text-lg font-medium text-muted-foreground">
              {t("delete_confirm_description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-3">
            <AlertDialogCancel className="rounded-xl px-6 font-bold">{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl px-6 font-bold shadow-lg shadow-rose-200 transition-all"
              disabled={isDeleting}
            >
              {isDeleting ? t("deleting") : t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
