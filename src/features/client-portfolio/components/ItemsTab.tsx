import { useState } from "react";

import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";

import { useTranslation } from "react-i18next";

import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

import {

  Table,

  TableBody,

  TableCell,

  TableHead,

  TableHeader,

  TableRow,

} from "@/components/ui/table";

import { Can } from "@/features/permissions/components/PermissionGate";

import { plainTextFromHtml } from "@/lib/plain-text-from-html";

import { useClientPortfolioItems } from "../hooks/useClientPortfolioItems";

import type { PortfolioItem } from "../types";



const CREATE_PATH = "/client-portfolio/items/create";



function editPath(id: number) {

  return `/client-portfolio/items/edit/${id}`;

}



function headlinePreview(item: PortfolioItem, lang: "ar" | "en"): string {

  const raw = item.headline[lang] || item.headline.en || item.headline.ar;

  return plainTextFromHtml(raw) || "—";

}



export default function ItemsTab() {

  const { t, i18n } = useTranslation("translation", { keyPrefix: "client_portfolio.items" });

  const lang = i18n.language?.toLowerCase().startsWith("ar") ? "ar" : "en";



  const { itemsQuery, deleteItem, isDeleting } = useClientPortfolioItems();



  const [deleteId, setDeleteId] = useState<number | null>(null);



  const rows = itemsQuery.data ?? [];



  const confirmDelete = () => {

    if (deleteId == null) return;

    deleteItem(deleteId, { onSuccess: () => setDeleteId(null) });

  };



  if (itemsQuery.isLoading) {

    return (

      <div className="flex justify-center py-20">

        <Loader2 className="h-10 w-10 animate-spin text-primary" />

      </div>

    );

  }

  if (itemsQuery.isError) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="font-medium text-destructive">{t("load_error")}</p>
        <Button type="button" variant="outline" className="rounded-xl" onClick={() => itemsQuery.refetch()}>
          {t("retry")}
        </Button>
      </div>
    );
  }

  return (

    <div className="space-y-8">

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

        <div className="space-y-1">

          <h2 className="text-2xl font-black tracking-tight">{t("title")}</h2>

          <p className="max-w-xl text-sm font-medium text-muted-foreground">{t("description")}</p>

        </div>

        <Can permission="home-content.update">

          <Button asChild className="gap-2 rounded-xl px-6 font-bold shadow-sm">

            <Link to={CREATE_PATH}>

              <Plus className="h-4 w-4" />

              {t("add_button")}

            </Link>

          </Button>

        </Can>

      </div>



      <div className="overflow-hidden rounded-[24px] border border-border/50 bg-white shadow-sm">

        <Table>

          <TableHeader>

            <TableRow className="bg-muted/30 hover:bg-muted/30">

              <TableHead className="w-16 font-bold">{t("table.image")}</TableHead>

              <TableHead className="font-bold">{t("table.headline")}</TableHead>

              <TableHead className="font-bold">{t("table.category")}</TableHead>

              <TableHead className="font-bold">{t("table.sort_order")}</TableHead>

              <TableHead className="font-bold">{t("table.active")}</TableHead>

              <TableHead className="font-bold">{t("table.services")}</TableHead>

              <TableHead className="text-end font-bold">{t("table.actions")}</TableHead>

            </TableRow>

          </TableHeader>

          <TableBody>

            {rows.length === 0 ? (

              <TableRow>

                <TableCell colSpan={7} className="py-16 text-center">

                  <p className="font-medium text-muted-foreground">{t("empty")}</p>

                  <Can permission="home-content.update">

                    <Button asChild variant="outline" className="mt-4 rounded-xl font-bold">

                      <Link to={CREATE_PATH}>

                        <Plus className="me-2 h-4 w-4" />

                        {t("add_button")}

                      </Link>

                    </Button>

                  </Can>

                </TableCell>

              </TableRow>

            ) : (

              rows.map((row) => (

                <TableRow key={row.id}>

                  <TableCell>

                    {row.image.ar || row.image.en ? (

                      <img

                        src={row.image.ar ?? row.image.en ?? ""}

                        alt=""

                        className="h-12 w-12 rounded-lg border object-cover"

                      />

                    ) : (

                      <div className="h-12 w-12 rounded-lg bg-muted" />

                    )}

                  </TableCell>

                  <TableCell className="max-w-[200px] truncate font-medium">

                    {headlinePreview(row, lang)}

                  </TableCell>

                  <TableCell className="text-sm text-muted-foreground">
                    {t(`categories.${row.category}`)}
                  </TableCell>

                  <TableCell>{row.sort_order}</TableCell>

                  <TableCell>{row.is_active ? t("yes") : t("no")}</TableCell>

                  <TableCell>{row.service_ids.length}</TableCell>

                  <TableCell className="text-end">

                    <div className="flex justify-end gap-2">

                      <Button type="button" size="sm" variant="outline" asChild>

                        <Link to={editPath(row.id)}>

                          <Pencil className="h-4 w-4" />

                        </Link>

                      </Button>

                      <Button

                        type="button"

                        size="sm"

                        variant="destructive"

                        disabled={isDeleting}

                        onClick={() => setDeleteId(row.id)}

                      >

                        <Trash2 className="h-4 w-4" />

                      </Button>

                    </div>

                  </TableCell>

                </TableRow>

              ))

            )}

          </TableBody>

        </Table>

      </div>



      {deleteId != null ? (

        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">

          <p className="text-sm">{t("delete_confirm")}</p>

          <Button size="sm" variant="destructive" onClick={confirmDelete} disabled={isDeleting}>

            {t("delete_yes")}

          </Button>

          <Button size="sm" variant="outline" onClick={() => setDeleteId(null)}>

            {t("cancel")}

          </Button>

        </div>

      ) : null}

    </div>

  );

}

