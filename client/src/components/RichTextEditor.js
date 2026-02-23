import React, { useState, useEffect, useRef } from 'react';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, convertFromRaw, convertToRaw } from 'draft-js';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

function RichTextEditor({
  initialContent,
  onChange,
  toolbarConfig,
  wrapperStyle,
  editorStyle,
  editorState: controlledEditorState,
  onEditorStateChange,
}) {
  const [localEditorState, setLocalEditorState] = useState(() => {
    if (controlledEditorState) return controlledEditorState;
    if (initialContent && typeof initialContent === 'object') {
      return EditorState.createWithContent(convertFromRaw(initialContent));
    }
    return EditorState.createEmpty();
  });

  const effectiveEditorState = controlledEditorState || localEditorState;

  useEffect(() => {
    if (!controlledEditorState && onChange) {
      const rawContent = convertToRaw(effectiveEditorState.getCurrentContent());
      onChange(rawContent);
    }
  }, [effectiveEditorState, controlledEditorState, onChange]);

  return (
    <Editor
      editorState={effectiveEditorState}
      onEditorStateChange={(newState) => {
        if (onEditorStateChange) {
          onEditorStateChange(newState);
        } else {
          setLocalEditorState(newState);
        }
      }}
      toolbar={toolbarConfig}
      wrapperStyle={wrapperStyle}
      editorStyle={editorStyle}
    />
  );
}

export default RichTextEditor;
