import {
  $applyNodeReplacement,
  ElementNode,
  type DOMConversionMap,
  type DOMConversionOutput,
  type DOMExportOutput,
  type EditorConfig,
  type LexicalNode,
  type NodeKey,
  type SerializedElementNode,
  type Spread,
} from "lexical";
import { createInlineStyleChildConversion } from "../lib/editor-html-styles";

export type SpanNodePayload = {
  className?: string;
  style?: string;
};

export type SerializedSpanNode = Spread<
  {
    type: "span";
    className?: string;
    style?: string;
  },
  SerializedElementNode
>;

function readSpanAttributes(domNode: HTMLElement): SpanNodePayload {
  return {
    className: domNode.getAttribute("class") ?? "",
    style: domNode.getAttribute("style") ?? "",
  };
}

function convertSpanElement(domNode: Node): DOMConversionOutput | null {
  const element = domNode as HTMLElement;
  const payload = readSpanAttributes(element);
  const node = $createSpanNode(payload);
  return {
    node,
    forChild: createInlineStyleChildConversion(element),
  };
}

export class SpanNode extends ElementNode {
  __className: string;
  __style: string;

  static getType(): string {
    return "span";
  }

  static clone(node: SpanNode): SpanNode {
    return new SpanNode(
      { className: node.__className, style: node.__style },
      node.__key,
    );
  }

  constructor(payload: SpanNodePayload = {}, key?: NodeKey) {
    super(key);
    this.__className = payload.className ?? "";
    this.__style = payload.style ?? "";
  }

  isInline(): boolean {
    return true;
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const element = document.createElement("span");
    if (this.__className) element.className = this.__className;
    if (this.__style) element.setAttribute("style", this.__style);
    return element;
  }

  updateDOM(prev: SpanNode): boolean {
    return prev.__className !== this.__className || prev.__style !== this.__style;
  }

  static importDOM(): DOMConversionMap | null {
    return {
      span: () => ({
        conversion: convertSpanElement,
        priority: 2,
      }),
    };
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("span");
    if (this.__className) element.className = this.__className;
    if (this.__style) element.setAttribute("style", this.__style);
    return { element };
  }

  exportJSON(): SerializedSpanNode {
    return {
      ...super.exportJSON(),
      type: "span",
      className: this.__className,
      style: this.__style,
      version: 1,
    };
  }

  static importJSON(serializedNode: SerializedSpanNode): SpanNode {
    return $createSpanNode({
      className: serializedNode.className ?? "",
      style: serializedNode.style ?? "",
    });
  }

  canInsertTextBefore(): boolean {
    return true;
  }

  canInsertTextAfter(): boolean {
    return true;
  }

  getClassName(): string {
    return this.getLatest().__className;
  }

  setClassName(className: string): this {
    const writable = this.getWritable();
    writable.__className = className;
    return writable;
  }

  getStyleAttr(): string {
    return this.getLatest().__style;
  }

  setStyleAttr(style: string): this {
    const writable = this.getWritable();
    writable.__style = style;
    return writable;
  }
}

export function $createSpanNode(payload?: SpanNodePayload): SpanNode {
  return $applyNodeReplacement(new SpanNode(payload));
}

export function $isSpanNode(node: LexicalNode | null | undefined): node is SpanNode {
  return node instanceof SpanNode;
}
