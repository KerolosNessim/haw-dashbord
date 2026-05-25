import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useCurrentEditor } from "@tiptap/react";
import { Minus, Plus } from "lucide-react";
import type { ElementType } from "react";
import { useEffect, useState } from "react";
import {
  DEFAULT_FONT_SIZE,
  EDITOR_FONT_SIZES,
  labelForFontSize,
  normalizeFontSize,
} from "../lib/editor-typography";

const SIZE_VALUES = EDITOR_FONT_SIZES.map((o) => o.value);

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

export default function TiptapFontSizeSelect() {
  const { editor } = useCurrentEditor();
  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);

  useEffect(() => {
    if (!editor) return;
    const sync = () => {
      const raw = (editor.getAttributes("textStyle").fontSize as string) || "";
      setFontSize(normalizeFontSize(raw || DEFAULT_FONT_SIZE));
    };
    sync();
    editor.on("selectionUpdate", sync);
    editor.on("transaction", sync);
    return () => {
      editor.off("selectionUpdate", sync);
      editor.off("transaction", sync);
    };
  }, [editor]);

  if (!editor) return null;

  const apply = (value: string) => {
    const normalized = normalizeFontSize(value);
    setFontSize(normalized);
    if (normalized === DEFAULT_FONT_SIZE) {
      editor.chain().focus().unsetFontSize().run();
    } else {
      editor.chain().focus().setFontSize(normalized).run();
    }
  };

  const step = (direction: "up" | "down") => {
    const idx = SIZE_VALUES.indexOf(fontSize as (typeof SIZE_VALUES)[number]);
    const safeIdx = idx === -1 ? SIZE_VALUES.indexOf(DEFAULT_FONT_SIZE) : idx;
    const next = direction === "up" ? safeIdx + 1 : safeIdx - 1;
    if (next < 0 || next >= SIZE_VALUES.length) return;
    apply(SIZE_VALUES[next]);
  };

  return (
    <div className="flex shrink-0 items-center gap-0.5 rounded-lg border border-border/60 bg-muted/25 p-0.5">
      <SizeStepButton onClick={() => step("down")} icon={Minus} title="Smaller" side="start" />
      <Select value={fontSize} onValueChange={apply}>
        <SelectTrigger className="h-8 w-[52px] border-0 bg-transparent px-1 text-xs shadow-none focus:ring-0">
          <SelectValue>{labelForFontSize(fontSize)}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {EDITOR_FONT_SIZES.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <SizeStepButton onClick={() => step("up")} icon={Plus} title="Larger" side="end" />
    </div>
  );
}
