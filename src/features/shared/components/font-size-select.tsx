import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import { $getSelection, $isRangeSelection, type LexicalEditor } from "lexical";
import { Minus, Plus } from "lucide-react";
import type { ElementType } from "react";
import { useCallback, useEffect, useState } from "react";
import {
  applyFontSizeToSelection,
  DEFAULT_FONT_SIZE,
  EDITOR_FONT_SIZES,
  labelForFontSize,
  resolveFontSizeFromSelection,
} from "./editor-font-utils";

const SIZE_VALUES = EDITOR_FONT_SIZES.map((o) => o.value);

function applyFontSize(editor: LexicalEditor, value: string) {
  editor.update(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return;
    applyFontSizeToSelection(selection, value);
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
    setFontSize(resolveFontSizeFromSelection(selection));
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
          <SelectValue>{labelForFontSize(fontSize)}</SelectValue>
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
