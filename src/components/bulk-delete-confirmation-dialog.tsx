import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";

export type BulkDeleteConfirmationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmationPhrase: string;
  typePhraseLabel: string;
  cancelLabel: string;
  deleteLabel: string;
  isPending: boolean;
  onConfirm: () => void | Promise<void>;
};

export function BulkDeleteConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmationPhrase,
  typePhraseLabel,
  cancelLabel,
  deleteLabel,
  isPending,
  onConfirm,
}: BulkDeleteConfirmationDialogProps) {
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (!open) setTyped("");
  }, [open]);

  const trimmed = typed.trim();
  const matches = trimmed === confirmationPhrase;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setTyped("");
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label htmlFor="bulk-delete-confirmation-input">{typePhraseLabel}</Label>
          <Input
            id="bulk-delete-confirmation-input"
            dir="ltr"
            autoComplete="off"
            placeholder={confirmationPhrase}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            className="rounded-xl"
          />
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="rounded-xl"
            disabled={!matches || isPending}
            onClick={() => void onConfirm()}
          >
            {deleteLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
