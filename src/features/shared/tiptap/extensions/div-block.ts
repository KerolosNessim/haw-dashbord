import { Node, mergeAttributes } from "@tiptap/core";

export const DivBlock = Node.create({
  name: "divBlock",
  group: "block",
  content: "block+",
  defining: true,

  parseHTML() {
    return [
      {
        tag: "div",
        getAttrs: (node) => {
          const el = node as HTMLElement;
          if (el.classList.contains("editor-toc") || el.classList.contains("cms-toc")) {
            return false;
          }
          return {
            class: el.getAttribute("class") ?? "editor-div",
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { class: HTMLAttributes.class ?? "editor-div block" }),
      0,
    ];
  },

  addCommands() {
    return {
      setDivBlock:
        () =>
        ({ commands }) =>
          commands.wrapIn(this.name),
    };
  },
});
