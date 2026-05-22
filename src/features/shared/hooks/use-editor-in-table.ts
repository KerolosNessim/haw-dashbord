import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $findTableNode } from "@lexical/table";
import { $getSelection, $isRangeSelection } from "lexical";
import { useEffect, useState } from "react";

/** True when the text cursor is inside a table cell. */
export function useEditorInTable(): boolean {
  const [editor] = useLexicalComposerContext();
  const [inTable, setInTable] = useState(false);

  useEffect(() => {
    const sync = () => {
      editor.getEditorState().read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
          setInTable(false);
          return;
        }
        setInTable($findTableNode(selection.anchor.getNode()) != null);
      });
    };

    sync();
    return editor.registerUpdateListener(() => {
      sync();
    });
  }, [editor]);

  return inTable;
}
