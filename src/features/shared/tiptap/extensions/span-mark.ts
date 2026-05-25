import { Mark, mergeAttributes } from "@tiptap/core";

export const SpanMark = Mark.create({
  name: "spanMark",

  parseHTML() {
    return [{ tag: "span" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setSpanMark:
        () =>
        ({ commands }) =>
          commands.setMark(this.name),
      toggleSpanMark:
        () =>
        ({ commands }) =>
          commands.toggleMark(this.name),
    };
  },
});
