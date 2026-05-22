import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import {
  $createParagraphNode,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_EDITOR,
} from "lexical";
import { useEffect } from "react";
import {
  $createImageNode,
  INSERT_IMAGE_COMMAND,
  type ImagePayload,
} from "./editor-image-node";

export function EditorTablePlugin() {
  return <TablePlugin hasCellMerge hasCellBackgroundColor hasTabHandler />;
}

export function EditorImagePlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand<ImagePayload>(
      INSERT_IMAGE_COMMAND,
      (payload) => {
        editor.update(() => {
          const imageNode = $createImageNode(payload);
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            selection.insertNodes([imageNode]);
            return;
          }
          const paragraph = $createParagraphNode();
          paragraph.append(imageNode);
          $getRoot().append(paragraph);
        });
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );
  }, [editor]);

  return null;
}
