import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelectionStyleValueForProperty,
  $patchStyleText,
} from "@lexical/selection";
import { mergeRegister } from "@lexical/utils";
import { $getSelection, $isRangeSelection, type LexicalEditor } from "lexical";
import { Minus, Plus } from "lucide-react";
import type { ElementType } from "react";
import { useCallback, useEffect, useState } from "react";

export const DEFAULT_FONT_SIZE = "16px";

/** Word-style sizes in px; 16 is the default (clears inline style, inherits editor base). */
export const EDITOR_FONT_SIZES = [
  { label: "8", value: "8px" },
  { label: "9", value: "9px" },
  { label: "10", value: "10px" },
  { label: "11", value: "11px" },
  { label: "12", value: "12px" },
  { label: "14", value: "14px" },
  { label: "16", value: "16px" },
  { label: "18", value: "18px" },
  { label: "20", value: "20px" },
  { label: "24", value: "24px" },
  { label: "28", value: "28px" },
  { label: "32", value: "32px" },
  { label: "36", value: "36px" },
  { label: "48", value: "48px" },
  { label: "72", value: "72px" },
] as const;

const SIZE_VALUES = EDITOR_FONT_SIZES.map((o) => o.value);

function labelForValue(value: string): string {
  return EDITOR_FONT_SIZES.find((o) => o.value === value)?.label ?? "16";
}

function normalizeFontSize(raw: string): string {
  if (!raw) return DEFAULT_FONT_SIZE;
  const exact = EDITOR_FONT_SIZES.find((o) => o.value === raw);
  if (exact) return exact.value;
  const px = raw.match(/^([\d.]+)px$/i);
  if (px) {
    const candidate = `${Math.round(Number(px[1]))}px`;
    if (EDITOR_FONT_SIZES.some((o) => o.value === candidate)) return candidate;
  }
  const pt = raw.match(/^([\d.]+)pt$/i);
  if (pt) {
    const pxNum = Math.round((Number(pt[1]) * 96) / 72);
    const candidate = `${pxNum}px`;
    if (EDITOR_FONT_SIZES.some((o) => o.value === candidate)) return candidate;
  }
  return DEFAULT_FONT_SIZE;
}

function applyFontSize(editor: LexicalEditor, value: string) {
  editor.update(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return;
    if (value === DEFAULT_FONT_SIZE) {
      $patchStyleText(selection, { "font-size": null });
    } else {
      $patchStyleText(selection, { "font-size": value });
    }
  });
}

function stepFontSize(current: string, direction: "up" | "down"): string {
  const idx = SIZE_VALUES.indexOf(current as (typeof SIZE_VALUES)[number]);
  const safeIdx = idx === -1 ? SIZE_VALUES.indexOf(DEFAULT_FONT_SIZE) : idx;
  const next = direction === "up" ? safeIdx + 1 : safeIdx - 1;
  if (next < 0) return SIZE_VALUES[0];
  if (next >= SIZE_VALUES.length) return SIZE_VALUES[SIZE_VALUES.length - 1];
  return SIZE_VALUES[next];
}

function SizeStepButton({
  onClick,
  icon: Icon,
  title,
  side,
}: {
  onClick: () => void;
  icon: ElementType;
  title: string;
  side: "start" | "end";
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center text-muted-foreground transition-colors",
        "hover:bg-muted hover:text-foreground",
        side === "start" && "border-e border-border",
        side === "end" && "border-s border-border",
      )}
    >
      <Icon size={14} strokeWidth={2.25} />
    </button>
  );
}

export default function FontSizeSelect() {
  const [editor] = useLexicalComposerContext();
  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);

  const syncFromSelection = useCallback(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return;
    const raw = $getSelectionStyleValueForProperty(selection, "font-size", "");
    setFontSize(normalizeFontSize(raw));
  }, []);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(syncFromSelection);
      }),
    );
  }, [editor, syncFromSelection]);

  const changeSize = (value: string) => {
    setFontSize(value);
    applyFontSize(editor, value);
  };

  const step = (direction: "up" | "down") => {
    changeSize(stepFontSize(fontSize, direction));
  };

  return (
    <div
      dir="ltr"
      className="inline-flex shrink-0 items-stretch overflow-hidden rounded-md border border-border bg-background shadow-sm"
      title="Font size"
    >
      <SizeStepButton
        side="start"
        title="Decrease font size"
        icon={Minus}
        onClick={() => step("down")}
      />
      <Select value={fontSize} onValueChange={changeSize}>
        <SelectTrigger
          size="sm"
          onMouseDown={(e) => e.preventDefault()}
          className={cn(
            "h-8 min-h-8 w-13 rounded-none border-0 bg-transparent px-2 shadow-none",
            "hover:bg-muted focus-visible:ring-0 focus-visible:ring-offset-0",
            "[&_svg]:size-3.5 [&_svg]:opacity-60",
          )}
        >
          <SelectValue>{labelForValue(fontSize)}</SelectValue>
        </SelectTrigger>
        <SelectContent align="center" className="max-h-60 min-w-16">
          {EDITOR_FONT_SIZES.map((option) => (
            <SelectItem key={option.value} value={option.value} className="justify-center">
              <span className="tabular-nums">{option.label}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <SizeStepButton
        side="end"
        title="Increase font size"
        icon={Plus}
        onClick={() => step("up")}
      />
    </div>
  );
}
