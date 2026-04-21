import { cn } from "@/lib/utils";
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
  Italic,
  List,
  ListOrdered,
  Quote,
  Redo,
  Strikethrough,
  Underline,
  Undo
} from "lucide-react";

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
        "p-2 rounded-md hover:bg-muted transition-colors",
        active && "bg-muted text-primary"
      )}
    >
      <Icon size={18} />
    </button>
  );
}

export default function Toolbar() {
  const [editor] = useLexicalComposerContext();

  const formatHeading = (level: "h1" | "h2" | "h3") => {
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
    <div className="flex flex-wrap gap-1 mb-2 p-1 bg-muted/20 border-b rounded-t-xl">
      {/* Undo/Redo */}
      <ToolbarButton onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)} icon={Undo} />
      <ToolbarButton onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)} icon={Redo} />
      
      <div className="w-px h-6 bg-border mx-1 self-center" />

      {/* Text Styles */}
      <ToolbarButton
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
        icon={Bold}
      />
      <ToolbarButton
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
        icon={Italic}
      />
      <ToolbarButton
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
        icon={Underline}
      />
      <ToolbarButton
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")}
        icon={Strikethrough}
      />
      <ToolbarButton
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code")}
        icon={Code}
      />

      <div className="w-px h-6 bg-border mx-1 self-center" />

      {/* Block Styles */}
      <ToolbarButton onClick={() => formatHeading("h1")} icon={Heading1} />
      <ToolbarButton onClick={() => formatHeading("h2")} icon={Heading2} />
      <ToolbarButton onClick={() => formatHeading("h3")} icon={Heading3} />
      <ToolbarButton onClick={formatQuote} icon={Quote} />

      <div className="w-px h-6 bg-border mx-1 self-center" />

      {/* Lists */}
      <ToolbarButton
        onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}
        icon={List}
      />
      <ToolbarButton
        onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}
        icon={ListOrdered}
      />

      <div className="w-px h-6 bg-border mx-1 self-center" />

      {/* Alignment */}
      <ToolbarButton
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left")}
        icon={AlignLeft}
      />
      <ToolbarButton
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center")}
        icon={AlignCenter}
      />
      <ToolbarButton
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right")}
        icon={AlignRight}
      />
      <ToolbarButton
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify")}
        icon={AlignJustify}
      />
    </div>
  );
}
