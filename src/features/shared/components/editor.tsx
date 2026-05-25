"use client";

import { cn } from "@/lib/utils";
import { EditorContent, EditorContext, useEditor } from "@tiptap/react";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { headingColorCssVariables } from "../lib/editor-colors";
import { buildEditorExtensions } from "../tiptap/build-extensions";
import TiptapToolbar from "./tiptap-toolbar";

export type EditorChangeValue = {
  html: string;
  text: string;
  isEmpty: boolean;
  json: unknown;
};

/** Use with react-hook-form: keeps field value as HTML string for API round-trip. */
export function editorOnChangeToHtml(val: unknown): string {
  if (val != null && typeof val === "object" && "html" in val) {
    return String((val as EditorChangeValue).html ?? "");
  }
  return typeof val === "string" ? val : "";
}

function editorValueSignature(value: unknown): string {
  if (value == null || value === "") return "";
  if (typeof value === "object" && value !== null && "html" in value) {
    return String((value as EditorChangeValue).html ?? "");
  }
  return String(value);
}

function resolveHtmlFromValue(value: unknown): string {
  if (value == null || value === "") return "";
  if (typeof value === "object" && value !== null && "html" in value) {
    return String((value as EditorChangeValue).html ?? "");
  }
  if (typeof value === "string") {
    if (value.startsWith("{")) {
      try {
        const parsed = JSON.parse(value) as { html?: string };
        if (typeof parsed.html === "string") return parsed.html;
      } catch {
        /* legacy lexical json — ignore */
      }
    }
    return value;
  }
  return "";
}

type Props = {
  value?: unknown;
  onChange?: (val: unknown) => void;
  placeholder?: string;
  dir?: "ltr" | "rtl";
  editorNamespace?: string;
  autoFocus?: boolean;
};

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write...",
  dir = "ltr",
  autoFocus = false,
}: Props) {
  const skipNextLoadRef = useRef(false);
  const loadedSignature = useRef<string | null>(null);
  const [headingColorVars, setHeadingColorVars] = useState(() => headingColorCssVariables());
  const editorSurfaceStyle = useMemo(
    () => headingColorVars as CSSProperties,
    [headingColorVars],
  );

  const emitChange = useCallback(
    (ed: NonNullable<ReturnType<typeof useEditor>>) => {
      if (!onChange) return;
      const html = ed.getHTML();
      const text = ed.getText();
      skipNextLoadRef.current = true;
      onChange({
        html,
        text,
        isEmpty: ed.isEmpty,
        json: ed.getJSON(),
      });
    },
    [onChange],
  );

  const extensions = useMemo(
    () => buildEditorExtensions(placeholder),
    [placeholder],
  );

  const editor = useEditor({
    extensions,
    content: resolveHtmlFromValue(value) || "<p></p>",
    autofocus: autoFocus ? "end" : false,
    editorProps: {
      attributes: {
        class: cn(
          "tiptap ProseMirror min-h-[250px] p-4 text-base outline-none",
          dir === "rtl" ? "text-right" : "text-left",
        ),
        dir,
        spellcheck: "false",
      },
      handleClick(view, _pos, event) {
        const target = event.target as HTMLElement;
        const anchor = target.closest("a[href^='#']");
        if (!anchor) return false;
        const hash = anchor.getAttribute("href");
        if (!hash || hash.length < 2) return false;
        const id = decodeURIComponent(hash.slice(1));
        const root = view.dom;
        const heading = root.querySelector(`#${CSS.escape(id)}`);
        if (!heading) return false;
        event.preventDefault();
        heading.scrollIntoView({ behavior: "smooth", block: "center" });
        return true;
      },
    },
    onUpdate: ({ editor: ed }) => emitChange(ed),
    onBlur: ({ editor: ed }) => emitChange(ed),
  });

  useEffect(() => {
    if (!editor) return;
    const signature = editorValueSignature(value);
    if (skipNextLoadRef.current) {
      skipNextLoadRef.current = false;
      loadedSignature.current = signature;
      return;
    }
    if (loadedSignature.current === signature) return;
    loadedSignature.current = signature;
    const html = resolveHtmlFromValue(value);
    editor.commands.setContent(html || "<p></p>", { emitUpdate: false });
  }, [value, editor]);

  const isRTL = dir === "rtl";

  if (!editor) return null;

  return (
    <div
      className="group flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition-all"
      dir={dir}
      style={editorSurfaceStyle}
    >
      <EditorContext.Provider value={{ editor }}>
        <TiptapToolbar
          onHeadingColorsChange={() => setHeadingColorVars(headingColorCssVariables())}
        />
        <div className="relative flex-1">
          <EditorContent editor={editor} />
          {editor.isEmpty ? (
            <div
              className={cn(
                "pointer-events-none absolute top-4 select-none text-muted-foreground/50",
                isRTL ? "right-4" : "left-4",
              )}
            >
              {placeholder}
            </div>
          ) : null}
        </div>
      </EditorContext.Provider>
    </div>
  );
}
