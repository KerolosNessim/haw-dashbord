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

/** Word-style point sizes (applied as inline font-size on selected text). */
export const EDITOR_FONT_SIZES = [
  { label: "Default", value: "default" },
  { label: "8", value: "8pt" },
  { label: "9", value: "9pt" },
  { label: "10", value: "10pt" },
  { label: "11", value: "11pt" },
  { label: "12", value: "12pt" },
  { label: "14", value: "14pt" },
  { label: "16", value: "16pt" },
  { label: "18", value: "18pt" },
  { label: "20", value: "20pt" },
  { label: "24", value: "24pt" },
  { label: "28", value: "28pt" },
  { label: "32", value: "32pt" },
  { label: "36", value: "36pt" },
  { label: "48", value: "48pt" },
  { label: "72", value: "72pt" },
] as const;

const SCALED_VALUES = EDITOR_FONT_SIZES.filter(
  (o) => o.value !== "default",
).map((o) => o.value);

function normalizeFontSize(raw: string): string {
  if (!raw) return "default";
  const match = EDITOR_FONT_SIZES.find((o) => o.value === raw);
  if (match) return match.value;
  const pt = raw.match(/^([\d.]+)pt$/i);
  if (pt) return `${pt[1]}pt`;
  const px = raw.match(/^([\d.]+)px$/i);
  if (px) {
    const ptNum = Math.round((Number(px[1]) * 72) / 96);
    const candidate = `${ptNum}pt`;
    if (EDITOR_FONT_SIZES.some((o) => o.value === candidate)) return candidate;
  }
  return "default";
}

function applyFontSize(editor: LexicalEditor, value: string) {
  editor.update(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return;
    if (value === "default") {
      $patchStyleText(selection, { "font-size": null });
    } else {
      $patchStyleText(selection, { "font-size": value });
    }
  });
}

function stepFontSize(current: string, direction: "up" | "down"): string {
  const idx = SCALED_VALUES.indexOf(current as (typeof SCALED_VALUES)[number]);
  if (idx === -1) {
    return direction === "up" ? SCALED_VALUES[0] : "default";
  }
  const next = direction === "up" ? idx + 1 : idx - 1;
  if (next < 0) return "default";
  if (next >= SCALED_VALUES.length) return SCALED_VALUES[SCALED_VALUES.length - 1];
  return SCALED_VALUES[next];
}

function SizeStepButton({
  onClick,
  icon: Icon,
  title,
}: {
  onClick: () => void;
  icon: ElementType;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className="p-2 rounded-md hover:bg-muted transition-colors"
    >
      <Icon size={16} />
    </button>
  );
}

export default function FontSizeSelect() {
  const [editor] = useLexicalComposerContext();
  const [fontSize, setFontSize] = useState("default");

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
    const next =
      fontSize === "default" && direction === "up"
        ? SCALED_VALUES[0]
        : stepFontSize(fontSize, direction);
    changeSize(next);
  };

  return (
    <div className="flex items-center gap-0.5">
      <SizeStepButton
        title="Decrease font size"
        icon={Minus}
        onClick={() => step("down")}
      />
      <Select value={fontSize} onValueChange={changeSize}>
        <SelectTrigger
          size="sm"
          title="Font size"
          onMouseDown={(e) => e.preventDefault()}
          className={cn(
            "h-8 w-17 border-0 bg-transparent shadow-none",
            "hover:bg-muted focus-visible:ring-1",
          )}
        >
          <SelectValue placeholder="Size" />
        </SelectTrigger>
        <SelectContent align="start" className="min-w-20">
          {EDITOR_FONT_SIZES.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <SizeStepButton
        title="Increase font size"
        icon={Plus}
        onClick={() => step("up")}
      />
    </div>
  );
}
