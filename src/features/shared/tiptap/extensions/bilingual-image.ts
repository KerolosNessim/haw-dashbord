import Image from "@tiptap/extension-image";
import { mergeAttributes } from "@tiptap/core";

export const BilingualImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      "data-alt-ar": {
        default: null,
        parseHTML: (el) => el.getAttribute("data-alt-ar"),
        renderHTML: (attrs) =>
          attrs["data-alt-ar"]
            ? { "data-alt-ar": attrs["data-alt-ar"] as string }
            : {},
      },
      "data-alt-en": {
        default: null,
        parseHTML: (el) => el.getAttribute("data-alt-en"),
        renderHTML: (attrs) =>
          attrs["data-alt-en"]
            ? { "data-alt-en": attrs["data-alt-en"] as string }
            : {},
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    const ar = HTMLAttributes["data-alt-ar"] as string | undefined;
    const en = HTMLAttributes["data-alt-en"] as string | undefined;
    const alt = (ar || en || "").trim();
    return [
      "img",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        alt,
        class: "editor-image my-3 max-h-[420px] max-w-full rounded-lg object-contain",
      }),
    ];
  },
});
