import Heading from "@tiptap/extension-heading";
import { mergeAttributes } from "@tiptap/core";

export const CustomHeading = Heading.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      id: {
        default: null,
        parseHTML: (element) => element.getAttribute("id"),
        renderHTML: (attributes) =>
          attributes.id ? { id: attributes.id as string } : {},
      },
    };
  },

  renderHTML({ node, HTMLAttributes }) {
    const level = node.attrs.level as number;
    const tag = `h${level}`;
    const cls = `editor-heading-h${level}`;
    return [
      tag,
      mergeAttributes(HTMLAttributes, { class: cls }),
      0,
    ];
  },
}).configure({
  levels: [1, 2, 3, 4, 5, 6],
});
