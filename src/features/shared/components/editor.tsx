import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { $getRoot } from "lexical";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { $generateHtmlFromNodes } from "@lexical/html";
import Toolbar from "./tool-bar";
import { cn } from "@/lib/utils";

const editorTheme = {
  ltr: "ltr text-left",
  rtl: "rtl text-right",
  placeholder: "editor-placeholder",
  paragraph: "editor-paragraph leading-normal min-h-[1.5em]",
  quote: "editor-quote border-s-4 border-gray-300 ps-4 italic my-2",
  heading: {
    h1: "editor-heading-h1 text-3xl font-bold my-4",
    h2: "editor-heading-h2 text-2xl font-bold my-3",
    h3: "editor-heading-h3 text-xl font-bold my-2",
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
  const config = {
    namespace: "editor",
    theme: editorTheme,
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode],
    onError: console.error,
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
                  "min-h-[250px] p-4 outline-none cursor-text",
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
        <AutoFocusPlugin />

        <HtmlPlugin onChange={onChange} />
      </LexicalComposer>
    </div>
  );
}

function HtmlPlugin({ onChange }: { onChange?: (val: unknown) => void }) {
  return (
    <OnChangePlugin
      onChange={(editorState, editor) => {
        editorState.read(() => {
          const root = $getRoot();
          const text = root.getTextContent();
          const json = editorState.toJSON();
          const html = $generateHtmlFromNodes(editor, null);
          onChange?.({ json, text, html, isEmpty: text.trim().length === 0 });
        });
      }}
    />
  );
}
