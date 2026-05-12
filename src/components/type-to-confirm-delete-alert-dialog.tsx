import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

function phraseRequiresExactCase(phrase: string): boolean {
  return [...phrase.trim()].some((ch) => ch.codePointAt(0)! > 127);
}

function inputMatchesPhrase(input: string, phrase: string): boolean {
  const a = input.trim();
  const b = phrase.trim();
  if (a.length === 0 || b.length === 0) return false;
  if (phraseRequiresExactCase(b)) return a === b;
  return a.toLowerCase() === b.toLowerCase();
}

export type TypeToConfirmDeleteAlertDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  /** User must type one of these exactly (ASCII phrases compared case-insensitively). */
  validPhrases: string[];
  typePhraseLabel: string;
  inputPlaceholder: string;
  inputDir?: "ltr" | "rtl" | "auto";
  cancelLabel: string;
  deleteLabel: string;
  isPending: boolean;
  onConfirm: () => void | Promise<void>;
};

export function TypeToConfirmDeleteAlertDialog({
  open,
  onOpenChange,
  title,
  description,
  validPhrases,
  typePhraseLabel,
  inputPlaceholder,
  inputDir = "auto",
  cancelLabel,
  deleteLabel,
  isPending,
  onConfirm,
}: TypeToConfirmDeleteAlertDialogProps) {
  const [typed, setTyped] = useState("");

  const matches = validPhrases.some((p) => inputMatchesPhrase(typed, p));

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        setTyped("");
        onOpenChange(next);
      }}
    >
      <AlertDialogContent className="rounded-2xl sm:max-w-md" size="default">
        <AlertDialogHeader className="text-start">
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-start">{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2 py-1">
          <Label htmlFor="type-to-confirm-delete-input">{typePhraseLabel}</Label>
          <Input
            id="type-to-confirm-delete-input"
            dir={inputDir}
            autoComplete="off"
            spellCheck={false}
            placeholder={inputPlaceholder}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            className="rounded-xl"
          />
        </div>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
          <AlertDialogCancel type="button" className="rounded-xl" disabled={isPending}>
            {cancelLabel}
          </AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            className="rounded-xl"
            disabled={!matches || isPending}
            onClick={() => void onConfirm()}
          >
            {deleteLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
