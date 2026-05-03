// import { Pencil, Trash2 } from "lucide-react";
// import { useTranslation } from "react-i18next";
import { Pencil, Trash2 } from "lucide-react";
import type { Service } from "../type";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

type ServiceCardProps = {
  service: Service,
};

export default function ServiceCard({
  service,
}: ServiceCardProps) {
  const { t } = useTranslation("translation", { keyPrefix: "services" });
  return (
    <div className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      {/* Image */}
      <div className="h-48 w-full overflow-hidden">
        <img
          src={service?.image}
          alt={service?.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Content */}
      <div className="space-y-2 p-5">
        <h3 className="text-lg font-semibold text-gray-900">{service?.title}</h3>

        <p className="text-sm text-gray-600 line-clamp-3">{service?.description}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 p-5 pt-0">
        <Link
          to={`/services/edit/${service?.id}`}
          className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition hover:bg-gray-100"
        >
          <Pencil size={16} />
          {t("edit_service")}
        </Link>

        <button
          className="flex items-center gap-2 rounded-lg bg-red-500 px-3 py-1.5 text-sm text-white transition hover:bg-red-600"
        >
          <Trash2 size={16} />
          {t("delete_service")}
        </button>
      </div>
    </div>
  );
}
