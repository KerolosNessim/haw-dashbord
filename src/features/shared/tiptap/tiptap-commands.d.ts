import "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    divBlock: {
      setDivBlock: () => ReturnType;
    };
    spanMark: {
      toggleSpanMark: () => ReturnType;
    };
  }
}
