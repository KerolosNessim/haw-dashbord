import { cn } from "@/lib/utils";
import { applyHeadingLevel } from "./editor-font-utils";
import FontSizeSelect from "./font-size-select";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import { $setBlocksType, $wrapNodes } from "@lexical/selection";
import { $isLinkNode, $toggleLink } from "@lexical/link";
import { $findMatchingParent } from "@lexical/utils";
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
} from "lexical";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  ArrowDownToLine,
  ArrowLeftToLine,
  ArrowRightToLine,
  ArrowUpToLine,
  Bold,
  Box,
  Braces,
  Code,
  Columns2,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo,
  Rows2,
  Strikethrough,
  Settings2,
  Table,
  Underline,
  Undo,
} from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { INSERT_IMAGE_COMMAND } from "./editor-image-node";
import { $createDivNode } from "./editor-div-node";
import { $createSpanNode } from "./editor-span-node";
import { EditorImageDialog } from "./editor-image-dialog";
import { EditorLinkDialog, type EditorLinkValues } from "./editor-link-dialog";
import { EditorTableDialog, type EditorTableDialogValues } from "./editor-table-dialog";
import {
  deleteTableColumn,
  deleteTableRow,
  insertTableColumnLeft,
  insertTableColumnRight,
  insertTableRowAbove,
  insertTableRowBelow,
} from "./editor-table-edit";
import { insertTableWithSizing } from "./editor-table-insert";
import EditorTextColorPicker from "./editor-text-color-picker";
import { EditorHeadingColorsDialog } from "./editor-heading-colors-dialog";
import { useEditorInTable } from "../hooks/use-editor-in-table";
import type { BilingualImageAlt } from "@/lib/bilingual-image-alt";
import { uploadEditorImage } from "../services/editor-image-upload";

interface ToolbarButtonProps {
  onClick: () => void;
  icon: React.ElementType;
  active?: boolean;
  title?: string;
  disabled?: boolean;
}

function ToolbarButton({ onClick, icon: Icon, active, title, disabled }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      title={title}
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors",
        "hover:bg-background hover:text-foreground",
        active && "bg-background text-primary shadow-sm",
        disabled && "pointer-events-none opacity-40",
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

type ToolbarProps = {
  onHeadingColorsChange?: () => void;
};

export default function Toolbar({ onHeadingColorsChange }: ToolbarProps) {
  const [editor] = useLexicalComposerContext();
  const { t } = useTranslation("translation", { keyPrefix: "editor" });
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkInitial, setLinkInitial] = useState<EditorLinkValues | undefined>();
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [pendingImageSrc, setPendingImageSrc] = useState<string | null>(null);
  const [tableDialogOpen, setTableDialogOpen] = useState(false);
  const [headingColorsOpen, setHeadingColorsOpen] = useState(false);
  const inTable = useEditorInTable();

  const formatHeading = (level: "h1" | "h2" | "h3" | "h4" | "h5" | "h6") => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      $setBlocksType(selection, () => $createHeadingNode(level));
      applyHeadingLevel(selection, level);
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

  const formatDiv = () => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      $setBlocksType(selection, () => $createDivNode());
    });
  };

  const wrapSpan = () => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection) || selection.isCollapsed()) return;
      $wrapNodes(selection, () => $createSpanNode());
    });
  };

  const readLinkFromSelection = (): EditorLinkValues | undefined => {
    let values: EditorLinkValues | undefined;
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      const linkNode = $findMatchingParent(selection.anchor.getNode(), $isLinkNode);
      if (!linkNode || !$isLinkNode(linkNode)) return;
      const rel = linkNode.getRel() ?? "";
      values = {
        url: linkNode.getURL(),
        nofollow: rel.includes("nofollow"),
        openInNewTab: linkNode.getTarget() === "_blank",
      };
    });
    return values;
  };

  const applyLink = (values: EditorLinkValues) => {
    editor.update(() => {
      $toggleLink(values.url, {
        rel: values.nofollow ? "nofollow" : null,
        target: values.openInNewTab ? "_blank" : null,
      });
    });
  };

  const removeLink = () => {
    editor.update(() => {
      $toggleLink(null);
    });
    setLinkOpen(false);
  };

  const insertTable = (values: EditorTableDialogValues) => {
    insertTableWithSizing(editor, values);
  };

  const handleImageFile = async (file: File) => {
    setUploadingImage(true);
    setImageDialogOpen(true);
    setPendingImageSrc(null);
    try {
      const src = await uploadEditorImage(file);
      setPendingImageSrc(src);
    } catch {
      toast.error(t("image_upload_failed"));
      setImageDialogOpen(false);
    } finally {
      setUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  const insertImageWithAlt = (alt: BilingualImageAlt) => {
    if (!pendingImageSrc) return;
    editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
      src: pendingImageSrc,
      alt,
    });
    setPendingImageSrc(null);
  };

  return (
    <>
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleImageFile(file);
        }}
      />

      <EditorLinkDialog
        open={linkOpen}
        onOpenChange={setLinkOpen}
        initial={linkInitial}
        onSubmit={applyLink}
        onRemove={linkInitial?.url ? removeLink : undefined}
      />

      <EditorImageDialog
        open={imageDialogOpen}
        onOpenChange={(open) => {
          setImageDialogOpen(open);
          if (!open) setPendingImageSrc(null);
        }}
        imageSrc={pendingImageSrc}
        isUploading={uploadingImage}
        onSubmit={({ alt }) => insertImageWithAlt(alt)}
      />

      <EditorTableDialog
        open={tableDialogOpen}
        onOpenChange={setTableDialogOpen}
        onSubmit={insertTable}
      />

      <EditorHeadingColorsDialog
        open={headingColorsOpen}
        onOpenChange={setHeadingColorsOpen}
        onSaved={onHeadingColorsChange}
      />

      <div className="flex flex-wrap items-center gap-1.5 border-b border-border/80 bg-muted/15 px-2 py-2">
        <ToolbarGroup>
          <ToolbarButton
            onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
            icon={Undo}
            title={t("undo")}
          />
          <ToolbarButton
            onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
            icon={Redo}
            title={t("redo")}
          />
        </ToolbarGroup>

        <ToolbarGroup>
          <ToolbarButton
            onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
            icon={Bold}
            title={t("bold")}
          />
          <ToolbarButton
            onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
            icon={Italic}
            title={t("italic")}
          />
          <ToolbarButton
            onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
            icon={Underline}
            title={t("underline")}
          />
          <ToolbarButton
            onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")}
            icon={Strikethrough}
            title={t("strikethrough")}
          />
          <ToolbarButton
            onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code")}
            icon={Code}
            title={t("code")}
          />
        </ToolbarGroup>

        <FontSizeSelect />

        <EditorTextColorPicker />

        <ToolbarGroup>
          <ToolbarButton
            title={t("insert_link")}
            onClick={() => {
              setLinkInitial(readLinkFromSelection());
              setLinkOpen(true);
            }}
            icon={Link2}
          />
          <ToolbarButton
            title={t("insert_image")}
            icon={ImageIcon}
            disabled={uploadingImage}
            onClick={() => imageInputRef.current?.click()}
          />
          <ToolbarButton
            title={t("insert_table")}
            onClick={() => setTableDialogOpen(true)}
            icon={Table}
          />
        </ToolbarGroup>

        {inTable ? (
          <>
            <ToolbarDivider />
            <ToolbarGroup className="border-primary/30 bg-primary/5">
              <ToolbarButton
                title={t("table_row_above")}
                onClick={() => insertTableRowAbove(editor)}
                icon={ArrowUpToLine}
              />
              <ToolbarButton
                title={t("table_row_below")}
                onClick={() => insertTableRowBelow(editor)}
                icon={ArrowDownToLine}
              />
              <ToolbarButton
                title={t("table_col_left")}
                onClick={() => insertTableColumnLeft(editor)}
                icon={ArrowLeftToLine}
              />
              <ToolbarButton
                title={t("table_col_right")}
                onClick={() => insertTableColumnRight(editor)}
                icon={ArrowRightToLine}
              />
              <ToolbarButton
                title={t("table_delete_row")}
                onClick={() => deleteTableRow(editor)}
                icon={Rows2}
              />
              <ToolbarButton
                title={t("table_delete_col")}
                onClick={() => deleteTableColumn(editor)}
                icon={Columns2}
              />
            </ToolbarGroup>
          </>
        ) : null}

        <ToolbarDivider />

        <ToolbarGroup className="max-w-full flex-wrap">
          <ToolbarButton
            onClick={() => setHeadingColorsOpen(true)}
            icon={Settings2}
            title={t("heading_colors_title")}
          />
          <ToolbarButton onClick={() => formatHeading("h1")} icon={Heading1} title={t("h1")} />
          <ToolbarButton onClick={() => formatHeading("h2")} icon={Heading2} title={t("h2")} />
          <ToolbarButton onClick={() => formatHeading("h3")} icon={Heading3} title={t("h3")} />
          <ToolbarButton onClick={() => formatHeading("h4")} icon={Heading4} title={t("h4")} />
          <ToolbarButton onClick={() => formatHeading("h5")} icon={Heading5} title={t("h5")} />
          <ToolbarButton onClick={() => formatHeading("h6")} icon={Heading6} title={t("h6")} />
          <ToolbarButton onClick={formatQuote} icon={Quote} title={t("quote")} />
          <ToolbarButton onClick={formatDiv} icon={Box} title={t("div_block")} />
          <ToolbarButton onClick={wrapSpan} icon={Braces} title={t("span_inline")} />
        </ToolbarGroup>

        <ToolbarDivider />

        <ToolbarGroup>
          <ToolbarButton
            onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}
            icon={List}
            title={t("bullet_list")}
          />
          <ToolbarButton
            onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}
            icon={ListOrdered}
            title={t("numbered_list")}
          />
        </ToolbarGroup>

        <ToolbarGroup>
          <ToolbarButton
            onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left")}
            icon={AlignLeft}
            title={t("align_left")}
          />
          <ToolbarButton
            onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center")}
            icon={AlignCenter}
            title={t("align_center")}
          />
          <ToolbarButton
            onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right")}
            icon={AlignRight}
            title={t("align_right")}
          />
          <ToolbarButton
            onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify")}
            icon={AlignJustify}
            title={t("align_justify")}
          />
        </ToolbarGroup>
      </div>
    </>
  );
}
