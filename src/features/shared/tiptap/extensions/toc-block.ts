import { Node, mergeAttributes } from "@tiptap/core";

/** Preserves table-of-contents blocks from legacy Lexical HTML. */
export const TocBlock = Node.create({
  name: "tocBlock",
  group: "block",
  content: "block+",
  defining: true,
  isolating: true,

  parseHTML() {
    return [
      {
        tag: "div",
        getAttrs: (node) => {
          const el = node as HTMLElement;
          const cls = el.getAttribute("class") ?? "";
          if (!cls.split(/\s+/).includes("editor-toc") && !cls.split(/\s+/).includes("cms-toc")) {
            return false;
          }
          return { class: "editor-toc cms-toc" };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { class: "editor-toc cms-toc" }),
      0,
    ];
  },
});
