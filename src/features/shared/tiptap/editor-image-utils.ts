import type { Editor } from "@tiptap/react";
import { NodeSelection } from "@tiptap/pm/state";
import type { EditorView } from "@tiptap/pm/view";
import {
  bilingualImageAltFromNodeAttrs,
  type BilingualImageAlt,
} from "@/lib/bilingual-image-alt";

export type EditorImageSnapshot = {
  pos: number;
  src: string;
  alt: BilingualImageAlt;
};

/** Document position of the selected (or spanned) image node, if any. */
export function getSelectedImagePos(editor: Editor): number | null {
  const { selection, doc } = editor.state;

  if (selection instanceof NodeSelection && selection.node.type.name === "image") {
    return selection.from;
  }

  if (!editor.isActive("image")) return null;

  const { from, to } = selection;
  let found: number | null = null;
  doc.nodesBetween(from, to, (node, pos) => {
    if (found == null && node.type.name === "image") found = pos;
  });
  return found;
}

export function readImageAtPos(editor: Editor, pos: number): EditorImageSnapshot | undefined {
  const node = editor.state.doc.nodeAt(pos);
  if (!node || node.type.name !== "image") return undefined;
  const src = node.attrs.src as string | undefined;
  if (!src) return undefined;
  return {
    pos,
    src,
    alt: bilingualImageAltFromNodeAttrs(node.attrs as Record<string, unknown>),
  };
}

export function imageAltAttrs(alt: BilingualImageAlt) {
  return {
    "data-alt-ar": alt.ar ?? "",
    "data-alt-en": alt.en ?? "",
  };
}

/** Resolve the image node position from a clicked `<img>` in the editor DOM. */
export function getImagePosFromDom(view: EditorView, img: Element): number | null {
  const pos = view.posAtDOM(img, 0);
  const $pos = view.state.doc.resolve(pos);

  if ($pos.nodeAfter?.type.name === "image") return pos;
  if ($pos.nodeBefore?.type.name === "image") {
    return pos - $pos.nodeBefore.nodeSize;
  }

  for (let depth = $pos.depth; depth > 0; depth -= 1) {
    const node = $pos.node(depth);
    if (node.type.name === "image") return $pos.before(depth);
  }

  return null;
}

export function selectImageAt(editor: Editor, pos: number): boolean {
  return editor.chain().focus().setNodeSelection(pos).run();
}
