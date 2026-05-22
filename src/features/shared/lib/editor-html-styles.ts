import { getCSSFromStyleObject, getStyleObjectFromCSS } from "@lexical/selection";
import type { DOMChildConversion, LexicalNode } from "lexical";
import { $isTextNode } from "lexical";

/** Inline styles we round-trip from saved CMS HTML into TextNode.__style. */
export const PRESERVED_TEXT_STYLE_PROPS = [
  "color",
  "font-size",
  "font-weight",
  "font-style",
  "text-decoration",
  "background-color",
] as const;

export function hasPreservableInlineStyle(element: HTMLElement): boolean {
  const attr = element.getAttribute("style");
  if (!attr?.trim()) return false;
  const styles = getStyleObjectFromCSS(attr);
  return PRESERVED_TEXT_STYLE_PROPS.some((prop) => Boolean(styles[prop]?.trim()));
}

export function applyTextFormatsFromDomStyle(
  lexicalNode: LexicalNode,
  style: CSSStyleDeclaration,
): LexicalNode {
  if (!$isTextNode(lexicalNode)) return lexicalNode;

  const fontWeight = style.fontWeight;
  const textDecoration = style.textDecoration.split(" ");
  const hasBoldFontWeight = fontWeight === "700" || fontWeight === "bold";
  const hasLinethroughTextDecoration = textDecoration.includes("line-through");
  const hasItalicFontStyle = style.fontStyle === "italic";
  const hasUnderlineTextDecoration = textDecoration.includes("underline");
  const verticalAlign = style.verticalAlign;

  if (hasBoldFontWeight && !lexicalNode.hasFormat("bold")) {
    lexicalNode.toggleFormat("bold");
  }
  if (hasLinethroughTextDecoration && !lexicalNode.hasFormat("strikethrough")) {
    lexicalNode.toggleFormat("strikethrough");
  }
  if (hasItalicFontStyle && !lexicalNode.hasFormat("italic")) {
    lexicalNode.toggleFormat("italic");
  }
  if (hasUnderlineTextDecoration && !lexicalNode.hasFormat("underline")) {
    lexicalNode.toggleFormat("underline");
  }
  if (verticalAlign === "sub" && !lexicalNode.hasFormat("subscript")) {
    lexicalNode.toggleFormat("subscript");
  }
  if (verticalAlign === "super" && !lexicalNode.hasFormat("superscript")) {
    lexicalNode.toggleFormat("superscript");
  }

  return lexicalNode;
}

export function mergeDomInlineStylesOntoTextNode(
  lexicalNode: LexicalNode,
  element: HTMLElement,
): LexicalNode {
  if (!$isTextNode(lexicalNode)) return lexicalNode;

  const imported = getStyleObjectFromCSS(element.getAttribute("style") ?? "");
  const current = getStyleObjectFromCSS(lexicalNode.getStyle());
  const merged: Record<string, string> = { ...current };

  for (const prop of PRESERVED_TEXT_STYLE_PROPS) {
    const value = imported[prop]?.trim();
    if (value) merged[prop] = value;
  }

  const cssText = getCSSFromStyleObject(merged);
  if (cssText) lexicalNode.setStyle(cssText);

  return applyTextFormatsFromDomStyle(lexicalNode, element.style);
}

export function createInlineStyleChildConversion(element: HTMLElement): DOMChildConversion {
  return (lexicalNode) => mergeDomInlineStylesOntoTextNode(lexicalNode, element);
}
