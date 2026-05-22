import type { BilingualImageAlt } from "@/lib/bilingual-image-alt";
import { emptyBilingualImageAlt } from "@/lib/bilingual-image-alt";
import {
  $applyNodeReplacement,
  DecoratorNode,
  type DOMConversionMap,
  type DOMConversionOutput,
  type DOMExportOutput,
  type EditorConfig,
  type LexicalCommand,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
  createCommand,
} from "lexical";
import type { JSX } from "react";

export type ImagePayload = {
  src: string;
  alt: BilingualImageAlt;
};

export const INSERT_IMAGE_COMMAND: LexicalCommand<ImagePayload> =
  createCommand("INSERT_IMAGE_COMMAND");

export type SerializedImageNode = Spread<
  {
    src: string;
    altAr: string;
    altEn: string;
    /** @deprecated legacy single alt */
    altText?: string;
  },
  SerializedLexicalNode
>;

function primaryAlt(alt: BilingualImageAlt): string {
  return (alt.ar || alt.en || "").trim();
}

function ImageComponent({ src, alt }: { src: string; alt: BilingualImageAlt }) {
  const displayAlt = primaryAlt(alt);
  return (
    <img
      src={src}
      alt={displayAlt}
      data-alt-ar={alt.ar}
      data-alt-en={alt.en}
      className="editor-image my-3 max-h-[420px] max-w-full rounded-lg object-contain"
      draggable={false}
    />
  );
}

function readAltFromImg(img: HTMLImageElement): BilingualImageAlt {
  const ar = img.getAttribute("data-alt-ar") ?? "";
  const en = img.getAttribute("data-alt-en") ?? "";
  if (ar || en) return { ar, en };
  const legacy = img.getAttribute("alt") ?? "";
  return { ar: legacy, en: legacy };
}

function convertImageElement(domNode: Node): DOMConversionOutput | null {
  const img = domNode as HTMLImageElement;
  const src = img.getAttribute("src") ?? "";
  if (!src) return null;
  const node = $createImageNode({
    alt: readAltFromImg(img),
    src,
  });
  return { node };
}

export class ImageNode extends DecoratorNode<JSX.Element> {
  __src: string;
  __altAr: string;
  __altEn: string;

  static getType(): string {
    return "image";
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(node.__src, { ar: node.__altAr, en: node.__altEn }, node.__key);
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    const legacy = serializedNode.altText ?? "";
    return $createImageNode({
      src: serializedNode.src,
      alt: {
        ar: serializedNode.altAr ?? legacy,
        en: serializedNode.altEn ?? legacy,
      },
    });
  }

  static importDOM(): DOMConversionMap | null {
    return {
      img: () => ({
        conversion: convertImageElement,
        priority: 0,
      }),
    };
  }

  constructor(src: string, alt: BilingualImageAlt, key?: NodeKey) {
    super(key);
    this.__src = src;
    this.__altAr = alt.ar ?? "";
    this.__altEn = alt.en ?? "";
  }

  exportJSON(): SerializedImageNode {
    return {
      altAr: this.__altAr,
      altEn: this.__altEn,
      src: this.__src,
      type: "image",
      version: 1,
    };
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("img");
    element.setAttribute("src", this.__src);
    element.setAttribute("data-alt-ar", this.__altAr);
    element.setAttribute("data-alt-en", this.__altEn);
    element.setAttribute("alt", primaryAlt({ ar: this.__altAr, en: this.__altEn }));
    element.className = "editor-image max-w-full h-auto rounded-lg";
    return { element };
  }

  createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement("span");
    const theme = config.theme;
    const className = theme.image ?? "editor-image-wrapper";
    if (className) span.className = className;
    return span;
  }

  updateDOM(): false {
    return false;
  }

  decorate(): JSX.Element {
    return (
      <ImageComponent src={this.__src} alt={{ ar: this.__altAr, en: this.__altEn }} />
    );
  }

  getSrc(): string {
    return this.__src;
  }

  getAlt(): BilingualImageAlt {
    return { ar: this.__altAr, en: this.__altEn };
  }

  setAlt(alt: BilingualImageAlt): void {
    const writable = this.getWritable();
    writable.__altAr = alt.ar ?? "";
    writable.__altEn = alt.en ?? "";
  }
}

export function $createImageNode({ alt, src }: ImagePayload): ImageNode {
  return $applyNodeReplacement(new ImageNode(src, alt ?? emptyBilingualImageAlt()));
}

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
  return node instanceof ImageNode;
}
