import { cn } from "@/lib/utils";
import { useCurrentEditor } from "@tiptap/react";
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
  Captions,
  ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  ListTree,
  Quote,
  Redo,
  Rows2,
  Strikethrough,
  Settings2,
  Table,
  Trash2,
  Underline,
  Undo,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  bilingualImageAltFromNodeAttrs,
  type BilingualImageAlt,
} from "@/lib/bilingual-image-alt";
import type { HeadingTagType } from "../lib/heading-types";
import { insertTableWithSizing } from "../tiptap/table-utils";
import { applyHeadingWithStyles, insertOrUpdateTableOfContents } from "../tiptap/toc-utils";
import { uploadEditorImage } from "../services/editor-image-upload";
import { EditorImageDialog } from "./editor-image-dialog";
import { EditorLinkDialog, type EditorLinkValues } from "./editor-link-dialog";
import { EditorTableDialog, type EditorTableDialogValues } from "./editor-table-dialog";
import { EditorHeadingColorsDialog } from "./editor-heading-colors-dialog";
import TiptapFontSizeSelect from "./tiptap-font-size-select";
import TiptapTextColorPicker from "./tiptap-text-color-picker";

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

type TiptapToolbarProps = {
  onHeadingColorsChange?: () => void;
};

export default function TiptapToolbar({ onHeadingColorsChange }: TiptapToolbarProps) {
  const { editor } = useCurrentEditor();
  const { t } = useTranslation("translation", { keyPrefix: "editor" });
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkInitial, setLinkInitial] = useState<EditorLinkValues | undefined>();
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageDialogMode, setImageDialogMode] = useState<"insert" | "edit">("insert");
  const [pendingImageSrc, setPendingImageSrc] = useState<string | null>(null);
  const [imageDialogInitialAlt, setImageDialogInitialAlt] = useState<BilingualImageAlt | undefined>();
  const [tableDialogOpen, setTableDialogOpen] = useState(false);
  const [headingColorsOpen, setHeadingColorsOpen] = useState(false);
  const [inTable, setInTable] = useState(false);
  const [inImage, setInImage] = useState(false);

  useEffect(() => {
    if (!editor) return;
    const sync = () => {
      setInTable(editor.isActive("table"));
      setInImage(editor.isActive("image"));
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

  const readLinkFromSelection = (): EditorLinkValues | undefined => {
    const attrs = editor.getAttributes("link");
    if (!attrs.href) return undefined;
    const rel = (attrs.rel as string) ?? "";
    return {
      url: String(attrs.href),
      nofollow: rel.includes("nofollow"),
      openInNewTab: attrs.target === "_blank",
    };
  };

  const applyLink = (values: EditorLinkValues) => {
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({
        href: values.url,
        target: values.openInNewTab ? "_blank" : null,
        rel: values.nofollow ? "nofollow" : null,
      })
      .run();
  };

  const removeLink = () => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    setLinkOpen(false);
  };

  const readImageFromSelection = (): { src: string; alt: BilingualImageAlt } | undefined => {
    if (!editor.isActive("image")) return undefined;
    const attrs = editor.getAttributes("image");
    const src = attrs.src as string | undefined;
    if (!src) return undefined;
    return { src, alt: bilingualImageAltFromNodeAttrs(attrs) };
  };

  const openEditImageAltDialog = () => {
    const selected = readImageFromSelection();
    if (!selected) return;
    setImageDialogMode("edit");
    setImageDialogInitialAlt(selected.alt);
    setPendingImageSrc(selected.src);
    setImageDialogOpen(true);
  };

  const handleImageFile = async (file: File) => {
    setUploadingImage(true);
    setImageDialogMode("insert");
    setImageDialogInitialAlt(undefined);
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

  const imageAltAttrs = (alt: BilingualImageAlt) => ({
    "data-alt-ar": alt.ar ?? "",
    "data-alt-en": alt.en ?? "",
  });

  const handleImageDialogSubmit = ({ alt }: { alt: BilingualImageAlt }) => {
    if (imageDialogMode === "edit") {
      editor.chain().focus().updateAttributes("image", imageAltAttrs(alt)).run();
      setPendingImageSrc(null);
      setImageDialogInitialAlt(undefined);
      return;
    }
    if (!pendingImageSrc) return;
    editor
      .chain()
      .focus()
      .setImage({
        src: pendingImageSrc,
        ...imageAltAttrs(alt),
      })
      .run();
    setPendingImageSrc(null);
  };

  const formatHeading = (level: HeadingTagType) => {
    applyHeadingWithStyles(editor, level);
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
          if (!open) {
            setPendingImageSrc(null);
            setImageDialogInitialAlt(undefined);
          }
        }}
        mode={imageDialogMode}
        imageSrc={pendingImageSrc}
        initialAlt={imageDialogInitialAlt}
        isUploading={uploadingImage}
        onSubmit={handleImageDialogSubmit}
      />

      <EditorTableDialog
        open={tableDialogOpen}
        onOpenChange={setTableDialogOpen}
        onSubmit={(values) => insertTableWithSizing(editor, values)}
      />

      <EditorHeadingColorsDialog
        open={headingColorsOpen}
        onOpenChange={setHeadingColorsOpen}
        onSaved={onHeadingColorsChange}
      />

      <div className="flex flex-wrap items-center gap-1.5 border-b border-border/80 bg-muted/15 px-2 py-2">
        <ToolbarGroup>
          <ToolbarButton onClick={() => editor.chain().focus().undo().run()} icon={Undo} title={t("undo")} />
          <ToolbarButton onClick={() => editor.chain().focus().redo().run()} icon={Redo} title={t("redo")} />
        </ToolbarGroup>

        <ToolbarGroup>
          <ToolbarButton
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
            icon={Bold}
            title={t("bold")}
          />
          <ToolbarButton
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            icon={Italic}
            title={t("italic")}
          />
          <ToolbarButton
            active={editor.isActive("underline")}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            icon={Underline}
            title={t("underline")}
          />
          <ToolbarButton
            active={editor.isActive("strike")}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            icon={Strikethrough}
            title={t("strikethrough")}
          />
          <ToolbarButton
            active={editor.isActive("code")}
            onClick={() => editor.chain().focus().toggleCode().run()}
            icon={Code}
            title={t("code")}
          />
        </ToolbarGroup>

        <TiptapFontSizeSelect />
        <TiptapTextColorPicker />

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
          {inImage ? (
            <ToolbarButton
              title={t("edit_image_alt")}
              icon={Captions}
              onClick={openEditImageAltDialog}
            />
          ) : null}
          <ToolbarButton
            title={t("insert_table")}
            onClick={() => setTableDialogOpen(true)}
            icon={Table}
          />
          <ToolbarButton
            title={t("insert_toc")}
            onClick={() => {
              const ok = insertOrUpdateTableOfContents(editor, { title: t("toc_title") });
              if (!ok) toast.error(t("toc_no_headings"));
            }}
            icon={ListTree}
          />
        </ToolbarGroup>

        {inTable ? (
          <>
            <ToolbarDivider />
            <ToolbarGroup className="border-primary/30 bg-primary/5">
              <ToolbarButton
                title={t("table_row_above")}
                onClick={() => editor.chain().focus().addRowBefore().run()}
                icon={ArrowUpToLine}
              />
              <ToolbarButton
                title={t("table_row_below")}
                onClick={() => editor.chain().focus().addRowAfter().run()}
                icon={ArrowDownToLine}
              />
              <ToolbarButton
                title={t("table_col_left")}
                onClick={() => editor.chain().focus().addColumnBefore().run()}
                icon={ArrowLeftToLine}
              />
              <ToolbarButton
                title={t("table_col_right")}
                onClick={() => editor.chain().focus().addColumnAfter().run()}
                icon={ArrowRightToLine}
              />
              <ToolbarButton
                title={t("table_delete_row")}
                onClick={() => editor.chain().focus().deleteRow().run()}
                icon={Rows2}
              />
              <ToolbarButton
                title={t("table_delete_col")}
                onClick={() => editor.chain().focus().deleteColumn().run()}
                icon={Columns2}
              />
              <ToolbarButton
                title={t("table_delete")}
                onClick={() => editor.chain().focus().deleteTable().run()}
                icon={Trash2}
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
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            icon={Quote}
            title={t("quote")}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().setDivBlock().run()}
            icon={Box}
            title={t("div_block")}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleSpanMark().run()}
            icon={Braces}
            title={t("span_inline")}
          />
        </ToolbarGroup>

        <ToolbarDivider />

        <ToolbarGroup>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            icon={List}
            title={t("bullet_list")}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            icon={ListOrdered}
            title={t("numbered_list")}
          />
        </ToolbarGroup>

        <ToolbarGroup>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            icon={AlignLeft}
            title={t("align_left")}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            icon={AlignCenter}
            title={t("align_center")}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            icon={AlignRight}
            title={t("align_right")}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            icon={AlignJustify}
            title={t("align_justify")}
          />
        </ToolbarGroup>
      </div>
    </>
  );
}
