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
import { Eye, Mail, Phone, Calendar, User as UserIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { User } from "../types/index";
import { LaravelResourcePagination } from "@/components/ui/laravel-resource-pagination";
import { useState } from "react";
import UserDetailsDialog from "./user-details-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UsersTableProps {
  users: User[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  isLoading: boolean;
  onPageChange: (page: number) => void;
}

export default function UsersTable({
  users,
  meta,
  isLoading,
  onPageChange,
}: UsersTableProps) {
  const { t, i18n } = useTranslation("translation", { keyPrefix: "users" });
  const isRtl = i18n.language.startsWith("ar");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
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
                  {t("table.user")}
                </TableHead>
                <TableHead className="text-start font-bold text-foreground">
                  {t("table.contact")}
                </TableHead>
                <TableHead className="text-start font-bold text-foreground">
                  {t("table.status")}
                </TableHead>
                <TableHead className="text-start font-bold text-foreground">
                  {t("table.joined_at")}
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
                      <TableCell key={j} className="py-4 px-6">
                        <div className="h-8 w-full bg-muted/40 animate-pulse rounded-lg" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-20 text-center text-muted-foreground">
                    {t("no_users")}
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow
                    key={user.id}
                    className="group border-border/40 transition-colors hover:bg-muted/5 cursor-pointer"
                    onClick={() => handleViewDetails(user)}
                  >
                    <TableCell className="py-5 px-6">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 border border-border/40 shadow-sm">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                            {user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 line-clamp-1">{user.name}</span>
                          <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[120px]">
                            {user.id}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      <div className="flex flex-col gap-1 justify-center items-start">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 opacity-50" />
                          <span className="truncate max-w-[150px]">{user.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5" dir="ltr">
                          <Phone className="w-3.5 h-3.5 opacity-50" />
                          <span className="text-start truncate">{user.phone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`rounded-full px-3 py-0.5 font-bold border-none ${
                          user.status === "active"
                            ? "bg-emerald-50 text-emerald-600"
                            : user.status === "suspended"
                            ? "bg-amber-50 text-amber-600"
                            : "bg-rose-50 text-rose-600"
                        }`}
                      >
                        {t(`status.${user.status}`)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs font-medium">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 opacity-50" />
                        {user.createdAt}
                      </div>
                    </TableCell>
                    <TableCell className="py-5 px-6">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-9 h-9 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/5 border border-transparent hover:border-primary/10 transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(user);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {!isLoading && users.length > 0 && (
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

      <UserDetailsDialog
        user={selectedUser}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </div>
  );
}
