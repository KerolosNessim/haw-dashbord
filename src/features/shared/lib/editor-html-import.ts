import { buildImportMap, type DOMChildConversion } from "lexical";
import {
  createInlineStyleChildConversion,
  hasPreservableInlineStyle,
} from "./editor-html-styles";

function createInlineStyleImportConversion() {
  return (domNode: HTMLElement) => {
    if (!hasPreservableInlineStyle(domNode)) return null;

    const forChild: DOMChildConversion = createInlineStyleChildConversion(domNode);

    return {
      conversion: () => ({
        forChild,
        node: null,
      }),
      priority: 1 as const,
    };
  };
}

/** Inline wrappers only — block tags (p, h1–h6, div) use dedicated node importers. */
const inlineStyleTags = [
  "strong",
  "b",
  "em",
  "i",
  "u",
  "mark",
  "s",
  "sub",
  "sup",
  "code",
] as const;

/** Merged into LexicalComposer `html.import` so colored text survives HTML reload. */
export const editorHtmlImportMap = buildImportMap(
  Object.fromEntries(
    inlineStyleTags.map((tag) => [tag, createInlineStyleImportConversion()]),
  ) as {
    [K in (typeof inlineStyleTags)[number]]: ReturnType<
      typeof createInlineStyleImportConversion
    >;
  },
);
