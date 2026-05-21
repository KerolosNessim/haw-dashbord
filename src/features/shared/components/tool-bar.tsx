import { cn } from "@/lib/utils";
import FontSizeSelect from "./font-size-select";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND
} from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createHeadingNode,
  $createQuoteNode
} from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND
} from "lexical";
import { TOGGLE_LINK_COMMAND } from "@lexical/link";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo,
  Strikethrough,
  Underline,
  Undo
} from "lucide-react";
import type { ReactNode } from "react";

interface ToolbarButtonProps {
  onClick: () => void;
  icon: React.ElementType;
  active?: boolean;
  title?: string;
}

function ToolbarButton({ onClick, icon: Icon, active, title }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      title={title}
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors",
        "hover:bg-background hover:text-foreground",
        active && "bg-background text-primary shadow-sm",
      )}
    >
      <Icon size={17} strokeWidth={2} />
    </button>
  );
}

function ToolbarDivider() {
  return <div className="mx-0.5 h-6 w-px shrink-0 self-center bg-border" />;
}

function ToolbarGroup({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center gap-0.5 rounded-lg border border-border/60 bg-muted/25 p-0.5",
        className,
      )}
    >
      {children}
    </div>
  );
}

export default function Toolbar() {
  const [editor] = useLexicalComposerContext();

  const formatHeading = (level: "h1" | "h2" | "h3" | "h4" | "h5" | "h6") => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode(level));
      }
    });
  };

  const formatQuote = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createQuoteNode());
      }
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 border-b border-border/80 bg-muted/15 px-2 py-2">
      <ToolbarGroup>
        <ToolbarButton onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)} icon={Undo} title="Undo" />
        <ToolbarButton onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)} icon={Redo} title="Redo" />
      </ToolbarGroup>

      <ToolbarGroup>
        <ToolbarButton
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
          icon={Bold}
          title="Bold"
        />
        <ToolbarButton
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
          icon={Italic}
          title="Italic"
        />
        <ToolbarButton
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
          icon={Underline}
          title="Underline"
        />
        <ToolbarButton
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")}
          icon={Strikethrough}
          title="Strikethrough"
        />
        <ToolbarButton
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code")}
          icon={Code}
          title="Code"
        />
      </ToolbarGroup>

      <FontSizeSelect />

      <ToolbarGroup>
        <ToolbarButton
          title="Insert / edit link"
          onClick={() => {
            const current = window.prompt("URL (leave empty to remove link):");
            if (current === null) return;
            const trimmed = current.trim();
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, trimmed === "" ? null : trimmed);
          }}
          icon={Link2}
        />
      </ToolbarGroup>

      <ToolbarDivider />

      <ToolbarGroup className="max-w-full flex-wrap">
        <ToolbarButton onClick={() => formatHeading("h1")} icon={Heading1} title="Heading 1" />
        <ToolbarButton onClick={() => formatHeading("h2")} icon={Heading2} title="Heading 2" />
        <ToolbarButton onClick={() => formatHeading("h3")} icon={Heading3} title="Heading 3" />
        <ToolbarButton onClick={() => formatHeading("h4")} icon={Heading4} title="Heading 4" />
        <ToolbarButton onClick={() => formatHeading("h5")} icon={Heading5} title="Heading 5" />
        <ToolbarButton onClick={() => formatHeading("h6")} icon={Heading6} title="Heading 6" />
        <ToolbarButton onClick={formatQuote} icon={Quote} title="Quote" />
      </ToolbarGroup>

      <ToolbarDivider />

      <ToolbarGroup>
        <ToolbarButton
          onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}
          icon={List}
          title="Bullet list"
        />
        <ToolbarButton
          onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}
          icon={ListOrdered}
          title="Numbered list"
        />
      </ToolbarGroup>

      <ToolbarGroup>
        <ToolbarButton
          onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left")}
          icon={AlignLeft}
          title="Align left"
        />
        <ToolbarButton
          onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center")}
          icon={AlignCenter}
          title="Align center"
        />
        <ToolbarButton
          onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right")}
          icon={AlignRight}
          title="Align right"
        />
        <ToolbarButton
          onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify")}
          icon={AlignJustify}
          title="Justify"
        />
      </ToolbarGroup>
    </div>
  );
}
