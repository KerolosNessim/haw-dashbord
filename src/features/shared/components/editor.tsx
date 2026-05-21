import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { $getRoot, $createParagraphNode, $createTextNode, $isElementNode } from "lexical";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { LinkNode } from "@lexical/link";
import { ListNode, ListItemNode } from "@lexical/list";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { useEffect, useRef, type MutableRefObject } from "react";
import Toolbar from "./tool-bar";
import { cn } from "@/lib/utils";

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
  if (typeof value === "object" && value !== null && "json" in value) {
    try {
      return JSON.stringify((value as EditorChangeValue).json);
    } catch {
      return "";
    }
  }
  if (typeof value === "object" && value !== null && "html" in value) {
    return String((value as EditorChangeValue).html ?? "");
  }
  return String(value);
}

const editorTheme = {
  ltr: "ltr text-left",
  rtl: "rtl text-right",
  placeholder: "editor-placeholder",
  paragraph: "editor-paragraph leading-normal min-h-[1.5em]",
  quote: "editor-quote border-s-4 border-gray-300 ps-4 italic my-2",
  heading: {
    h1: "editor-heading-h1",
    h2: "editor-heading-h2",
    h3: "editor-heading-h3",
    h4: "editor-heading-h4",
    h5: "editor-heading-h5",
    h6: "editor-heading-h6",
  },
  list: {
    nested: {
      listitem: "editor-nested-listitem",
    },
    ol: "editor-list-ol list-decimal ps-6 my-2",
    ul: "editor-list-ul list-disc ps-6 my-2",
    listitem: "editor-listitem",
  },
  text: {
    bold: "font-bold",
    italic: "italic",
    underline: "underline",
    strikethrough: "line-through",
    underlineStrikethrough: "underline line-through",
    code: "bg-gray-100 p-1 rounded font-mono text-sm",
  },
  link: "text-primary underline underline-offset-2 cursor-pointer",
};

type Props = {
  value?: unknown;
  onChange?: (val: unknown) => void;
  placeholder?: string;
  dir?: "ltr" | "rtl";
};

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write...",
  dir = "ltr",
}: Props) {
  const skipNextLoadRef = useRef(false);

  const config = {
    namespace: "editor",
    theme: editorTheme,
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode],
    onError: console.error,
    editorState: () => {
      if (!value) return;
      // If it's the object structure we return in onChange
      if (typeof value === "object" && value !== null && "json" in value) {
        return JSON.stringify((value as unknown).json);
      }
      // If it's a string (could be JSON or handled by a conversion plugin)
      if (typeof value === "string" && value.startsWith("{")) {
        return value;
      }
      return undefined; // Default empty
    },
  };

  const isRTL = dir === "rtl";

  return (
    <div
      className="group border rounded-xl bg-white shadow-sm overflow-hidden flex flex-col  transition-all"
      dir={dir}
    >
      <LexicalComposer initialConfig={config}>
        <Toolbar />

        <div className="relative flex-1">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className={cn(
                  "min-h-[250px] p-4 text-base outline-none cursor-text",
                  isRTL ? "text-right" : "text-left",
                )}
                style={{ direction: dir, caretColor: "black" }}
                spellCheck={false}
              />
            }
            placeholder={
              <div
                className={cn(
                  "absolute top-4 pointer-events-none text-muted-foreground/50 select-none",
                  dir === "rtl" ? "right-4" : "left-4",
                )}
              >
                {placeholder}
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>

        <HistoryPlugin />
        <ListPlugin />
        <LinkPlugin />
        <AutoFocusPlugin />

        <LoadContentPlugin value={value} skipNextLoadRef={skipNextLoadRef} />
        <HtmlPlugin onChange={onChange} skipNextLoadRef={skipNextLoadRef} />
      </LexicalComposer>
    </div>
  );
}

function HtmlPlugin({
  onChange,
  skipNextLoadRef,
}: {
  onChange?: (val: unknown) => void;
  skipNextLoadRef: MutableRefObject<boolean>;
}) {
  return (
    <OnChangePlugin
      onChange={(editorState, editor) => {
        editorState.read(() => {
          const root = $getRoot();
          const text = root.getTextContent();
          const json = editorState.toJSON();
          const html = $generateHtmlFromNodes(editor, null);
          skipNextLoadRef.current = true;
          onChange?.({ json, text, html, isEmpty: text.trim().length === 0 });
        });
      }}
    />
  );
}

function LoadContentPlugin({
  value,
  skipNextLoadRef,
}: {
  value: unknown;
  skipNextLoadRef: MutableRefObject<boolean>;
}) {
  const [editor] = useLexicalComposerContext();
  const loadedSignature = useRef<string | null>(null);

  useEffect(() => {
    const signature = editorValueSignature(value);

    if (skipNextLoadRef.current) {
      skipNextLoadRef.current = false;
      loadedSignature.current = signature;
      return;
    }

    if (loadedSignature.current === signature) return;
    loadedSignature.current = signature;

    editor.update(() => {
      const root = $getRoot();
      root.clear();

      if (!signature) return;

      if (typeof value === "object" && value !== null && "json" in value && (value as EditorChangeValue).json) {
        editor.setEditorState(editor.parseEditorState((value as EditorChangeValue).json));
        return;
      }

      const html =
        typeof value === "string"
          ? value
          : typeof value === "object" && value !== null && "html" in value
            ? String((value as EditorChangeValue).html ?? "")
            : "";

      if (html.startsWith("{")) {
        try {
          const json = JSON.parse(html);
          editor.setEditorState(editor.parseEditorState(json));
          return;
        } catch {
          /* fall through to HTML parse */
        }
      }

      const parser = new DOMParser();
      const dom = parser.parseFromString(html, "text/html");
      const nodes = $generateNodesFromDOM(editor, dom);

      if (nodes.length > 0) {
        nodes.forEach((node) => {
          if ($isElementNode(node)) {
            root.append(node);
          } else {
            const paragraph = $createParagraphNode();
            paragraph.append(node);
            root.append(paragraph);
          }
        });
      } else if (html.trim()) {
        const paragraph = $createParagraphNode();
        paragraph.append($createTextNode(html));
        root.append(paragraph);
      }
    });
  }, [value, editor]);

  return null;
}
