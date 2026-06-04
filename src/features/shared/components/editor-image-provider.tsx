"use client";

import type { BilingualImageAlt } from "@/lib/bilingual-image-alt";
import { useCurrentEditor } from "@tiptap/react";
import { Captions } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BubbleMenu } from "@tiptap/react/menus";
import {
  getImagePosFromDom,
  getSelectedImagePos,
  imageAltAttrs,
  readImageAtPos,
  selectImageAt,
} from "../tiptap/editor-image-utils";
import { uploadEditorImage } from "../services/editor-image-upload";
import { EditorImageDialog } from "./editor-image-dialog";

type EditorImageContextValue = {
  openEditImageAltDialog: () => void;
  triggerImageUpload: () => void;
  uploadingImage: boolean;
  inImage: boolean;
};

const EditorImageContext = createContext<EditorImageContextValue | null>(null);

export function useEditorImage(): EditorImageContextValue {
  const ctx = useContext(EditorImageContext);
  if (!ctx) {
    throw new Error("useEditorImage must be used within EditorImageProvider");
  }
  return ctx;
}

type EditorImageProviderProps = {
  children: ReactNode;
};

export function EditorImageProvider({ children }: EditorImageProviderProps) {
  const { editor } = useCurrentEditor();
  const { t } = useTranslation("translation", { keyPrefix: "editor" });
  const imageInputRef = useRef<HTMLInputElement>(null);
  const imageEditPosRef = useRef<number | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageDialogMode, setImageDialogMode] = useState<"insert" | "edit">("insert");
  const [pendingImageSrc, setPendingImageSrc] = useState<string | null>(null);
  const [imageDialogInitialAlt, setImageDialogInitialAlt] = useState<BilingualImageAlt | undefined>();
  const [inImage, setInImage] = useState(false);

  useEffect(() => {
    if (!editor) return;
    const sync = () => setInImage(editor.isActive("image"));
    sync();
    editor.on("selectionUpdate", sync);
    editor.on("transaction", sync);
    return () => {
      editor.off("selectionUpdate", sync);
      editor.off("transaction", sync);
    };
  }, [editor]);

  const openEditAtPos = useCallback(
    (pos: number) => {
      if (!editor) return;
      const snapshot = readImageAtPos(editor, pos);
      if (!snapshot) return;
      imageEditPosRef.current = pos;
      setImageDialogMode("edit");
      setImageDialogInitialAlt(snapshot.alt);
      setPendingImageSrc(snapshot.src);
      setImageDialogOpen(true);
    },
    [editor],
  );

  const openEditImageAltDialog = useCallback(() => {
    if (!editor) return;
    const pos = getSelectedImagePos(editor);
    if (pos == null) return;
    selectImageAt(editor, pos);
    openEditAtPos(pos);
  }, [editor, openEditAtPos]);

  const handleImageFile = useCallback(
    async (file: File) => {
      setUploadingImage(true);
      setImageDialogMode("insert");
      setImageDialogInitialAlt(undefined);
      imageEditPosRef.current = null;
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
    },
    [imageInputRef, t],
  );

  const handleImageDialogSubmit = useCallback(
    ({ alt }: { alt: BilingualImageAlt }) => {
      if (!editor) return;

      if (imageDialogMode === "edit") {
        const pos = imageEditPosRef.current;
        if (pos == null) {
          toast.error(t("image_edit_failed"));
          return;
        }
        const ok = editor
          .chain()
          .setNodeSelection(pos)
          .updateAttributes("image", imageAltAttrs(alt))
          .run();
        if (!ok) {
          toast.error(t("image_edit_failed"));
          return;
        }
        imageEditPosRef.current = null;
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
    },
    [editor, imageDialogMode, pendingImageSrc, t],
  );

  useEffect(() => {
    if (!editor) return;

    const dom = editor.view.dom;

    const onClick = (event: MouseEvent) => {
      const img = (event.target as HTMLElement).closest("img.editor-image");
      if (!img || !dom.contains(img)) return;
      const pos = getImagePosFromDom(editor.view, img);
      if (pos == null) return;
      selectImageAt(editor, pos);
    };

    const onDblClick = (event: MouseEvent) => {
      const img = (event.target as HTMLElement).closest("img.editor-image");
      if (!img || !dom.contains(img)) return;
      event.preventDefault();
      const pos = getImagePosFromDom(editor.view, img);
      if (pos == null) return;
      selectImageAt(editor, pos);
      openEditAtPos(pos);
    };

    dom.addEventListener("click", onClick);
    dom.addEventListener("dblclick", onDblClick);
    return () => {
      dom.removeEventListener("click", onClick);
      dom.removeEventListener("dblclick", onDblClick);
    };
  }, [editor, openEditAtPos]);

  const triggerImageUpload = useCallback(() => {
    imageInputRef.current?.click();
  }, [imageInputRef]);

  const ctxValue: EditorImageContextValue = {
    openEditImageAltDialog,
    triggerImageUpload,
    uploadingImage,
    inImage,
  };

  if (!editor) {
    return <>{children}</>;
  }

  return (
    <EditorImageContext.Provider value={ctxValue}>
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

      <EditorImageDialog
        open={imageDialogOpen}
        onOpenChange={(open) => {
          setImageDialogOpen(open);
          if (!open) {
            setPendingImageSrc(null);
            setImageDialogInitialAlt(undefined);
            imageEditPosRef.current = null;
          }
        }}
        mode={imageDialogMode}
        imageSrc={pendingImageSrc}
        initialAlt={imageDialogInitialAlt}
        isUploading={uploadingImage}
        onSubmit={handleImageDialogSubmit}
      />

      <BubbleMenu
        editor={editor}
        shouldShow={({ editor: ed }) => ed.isActive("image")}
        options={{ placement: "top", offset: 8 }}
        className={cn(
          "flex items-center gap-1 rounded-lg border border-border/80 bg-background p-1 shadow-md",
        )}
      >
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 px-2 text-xs"
          onMouseDown={(e) => e.preventDefault()}
          onClick={openEditImageAltDialog}
        >
          <Captions className="size-3.5" />
          {t("edit_image_alt")}
        </Button>
      </BubbleMenu>

      {children}
    </EditorImageContext.Provider>
  );
}
