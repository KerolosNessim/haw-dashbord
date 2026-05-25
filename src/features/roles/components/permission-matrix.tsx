import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { PermissionGroup } from "../types";
import { useTranslation } from "react-i18next";
import {
  getPermissionGroupLabel,
  getPermissionLabel,
} from "../utils/permission-labels";

type PermissionMatrixProps = {
  groups: PermissionGroup[];
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
};

export function PermissionMatrix({
  groups,
  value,
  onChange,
  disabled,
}: PermissionMatrixProps) {
  const { t } = useTranslation("translation", { keyPrefix: "roles" });
  const selected = new Set(value);

  const toggle = (name: string, checked: boolean) => {
    const next = new Set(selected);
    if (checked) next.add(name);
    else next.delete(name);
    onChange([...next]);
  };

  const toggleGroup = (group: PermissionGroup, checked: boolean) => {
    const next = new Set(selected);
    for (const p of group.permissions) {
      if (checked) next.add(p.name);
      else next.delete(p.name);
    }
    onChange([...next]);
  };

  return (
    <div className="max-h-[min(36rem,55vh)] space-y-6 overflow-y-auto rounded-xl border bg-muted/20 p-4">
      {groups.map((group) => {
        const names = group.permissions.map((p) => p.name);
        const allChecked = names.length > 0 && names.every((n) => selected.has(n));
        const someChecked = names.some((n) => selected.has(n));

        return (
          <div key={group.key} className="space-y-3">
            <div className="flex items-center gap-2 border-b pb-2">
              <Checkbox
                id={`group-${group.key}`}
                checked={allChecked ? true : someChecked ? "indeterminate" : false}
                disabled={disabled}
                onCheckedChange={(c) => toggleGroup(group, c === true)}
              />
              <Label htmlFor={`group-${group.key}`} className="font-semibold">
                {getPermissionGroupLabel(t, group.key, group.label)}
              </Label>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {group.permissions.map((perm) => (
                <label
                  key={perm.name}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm"
                >
                  <Checkbox
                    checked={selected.has(perm.name)}
                    disabled={disabled}
                    onCheckedChange={(c) => toggle(perm.name, c === true)}
                  />
                  <span>{getPermissionLabel(t, perm.name, perm.label)}</span>
                </label>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
