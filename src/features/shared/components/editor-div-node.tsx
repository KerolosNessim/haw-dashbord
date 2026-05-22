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

export type DivNodePayload = {
  className?: string;
  style?: string;
};

export type SerializedDivNode = Spread<
  {
    type: "div";
    className?: string;
    style?: string;
  },
  SerializedElementNode
>;

function readDivAttributes(domNode: HTMLElement): DivNodePayload {
  return {
    className: domNode.getAttribute("class") ?? "",
    style: domNode.getAttribute("style") ?? "",
  };
}

function convertDivElement(domNode: Node): DOMConversionOutput | null {
  const element = domNode as HTMLElement;
  const node = $createDivNode(readDivAttributes(element));
  return {
    node,
    forChild: createInlineStyleChildConversion(element),
  };
}

export class DivNode extends ElementNode {
  __className: string;
  __style: string;

  static getType(): string {
    return "div";
  }

  static clone(node: DivNode): DivNode {
    return new DivNode(
      { className: node.__className, style: node.__style },
      node.__key,
    );
  }

  constructor(payload: DivNodePayload = {}, key?: NodeKey) {
    super(key);
    this.__className = payload.className ?? "";
    this.__style = payload.style ?? "";
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const element = document.createElement("div");
    if (this.__className) element.className = this.__className;
    if (this.__style) element.setAttribute("style", this.__style);
    return element;
  }

  updateDOM(prev: DivNode): boolean {
    return prev.__className !== this.__className || prev.__style !== this.__style;
  }

  static importDOM(): DOMConversionMap | null {
    return {
      div: () => ({
        conversion: convertDivElement,
        priority: 2,
      }),
    };
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("div");
    if (this.__className) element.className = this.__className;
    if (this.__style) element.setAttribute("style", this.__style);
    return { element };
  }

  exportJSON(): SerializedDivNode {
    return {
      ...super.exportJSON(),
      type: "div",
      className: this.__className,
      style: this.__style,
      version: 1,
    };
  }

  static importJSON(serializedNode: SerializedDivNode): DivNode {
    return $createDivNode({
      className: serializedNode.className ?? "",
      style: serializedNode.style ?? "",
    });
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

export function $createDivNode(payload?: DivNodePayload): DivNode {
  return $applyNodeReplacement(new DivNode(payload));
}

export function $isDivNode(node: LexicalNode | null | undefined): node is DivNode {
  return node instanceof DivNode;
}
