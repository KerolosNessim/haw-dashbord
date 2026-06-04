import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useAdminCountries,
  useDeleteCountry,
} from "@/features/countries/hooks/useCountries";
import type { Country } from "@/features/countries/types";
import { Loader2, Pencil, Search, Trash2 } from "lucide-react";
import { countryFlagEmoji } from "@/features/countries/lib/country-flag";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import CountryDialog from "./country-dialog";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function CountriesTable() {
  const { t, i18n } = useTranslation("translation", { keyPrefix: "countries" });
  const { t: commonT } = useTranslation("translation");
  const isRtl = i18n.language.startsWith("ar");

  const { data, isLoading } = useAdminCountries();
  const { mutateAsync: deleteCountry, isPending: isDeleting } =
    useDeleteCountry();

  const [search, setSearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const countries = data?.data ?? [];

  const filteredCountries = useMemo(() => {
    const q = search.toLowerCase();
    return countries.filter(
      (c) =>
        c.name.ar.toLowerCase().includes(q) ||
        c.name.en.toLowerCase().includes(q),
    );
  }, [countries, search]);

  const handleEdit = (country: Country) => {
    setSelectedCountry(country);
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteCountry(id);
      toast.success(commonT("success_message") || "Deleted successfully");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error(commonT("error_message") || "Something went wrong");
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-border/40">
        <div className="relative w-full max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-60" />
          <Input
            placeholder={commonT("search_placeholder") || "Search..."}
            className="h-11 pr-10 rounded-xl border-border/60 bg-muted/5 focus-visible:ring-primary/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-border/40 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table dir={isRtl ? "rtl" : "ltr"}>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="text-start py-5 px-6 font-bold text-foreground">
                  {t("table.image")}
                </TableHead>
                <TableHead className="text-start font-bold text-foreground">
                  {t("table.name_ar")}
                </TableHead>
                <TableHead className="text-start font-bold text-foreground">
                  {t("table.name_en")}
                </TableHead>
                <TableHead className="text-start font-bold text-foreground">
                  {t("table.status")}
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
                    <TableCell colSpan={5}>
                      <div className="h-12 bg-muted/20 animate-pulse rounded-xl" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredCountries.length > 0 ? (
                filteredCountries.map((country) => (
                  <TableRow
                    key={country.id}
                    className="group transition-colors hover:bg-muted/5 border-border/40"
                  >
                    <TableCell className="py-4 px-6">
                      <div className="w-12 h-12 rounded-xl border border-border/60 overflow-hidden shadow-sm bg-muted/20">
                        {country.image ? (
                          <img
                            src={country.image}
                            alt=""
                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-2xl">
                            <span aria-hidden>{countryFlagEmoji(country)}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-gray-900">
                      {country.name.ar}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {country.name.en}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={country.is_active ? "default" : "secondary"}
                        className={cn(
                          "font-bold",
                          country.is_active
                            ? "bg-green-500 hover:bg-green-600"
                            : "bg-red-500 hover:bg-red-600 text-white",
                        )}
                      >
                        {country.is_active
                          ? commonT("active") || "Active"
                          : commonT("inactive") || "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(country)}
                          className="w-9 h-9 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/5 border border-transparent hover:border-primary/20 transition-all"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={isDeleting}
                          onClick={() => handleDelete(country.id)}
                          className="w-9 h-9 rounded-xl text-muted-foreground hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all"
                        >
                          {isDeleting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-12 text-center text-muted-foreground"
                  >
                    {commonT("no_data") || "No countries found"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <CountryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        country={selectedCountry}
      />
    </div>
  );
}
