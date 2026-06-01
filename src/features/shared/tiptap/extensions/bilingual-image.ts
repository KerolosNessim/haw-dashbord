import Image from "@tiptap/extension-image";
import { mergeAttributes } from "@tiptap/core";

export const BilingualImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      "data-alt-ar": {
        default: null,
        parseHTML: (el) => el.getAttribute("data-alt-ar"),
        renderHTML: (attrs) => {
          const v = attrs["data-alt-ar"];
          if (v == null) return {};
          return { "data-alt-ar": String(v) };
        },
      },
      "data-alt-en": {
        default: null,
        parseHTML: (el) => el.getAttribute("data-alt-en"),
        renderHTML: (attrs) => {
          const v = attrs["data-alt-en"];
          if (v == null) return {};
          return { "data-alt-en": String(v) };
        },
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
