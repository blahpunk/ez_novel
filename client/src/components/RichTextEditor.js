import React, { useState, useEffect } from 'react';
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
  placeholder,
  ...rest
}) {
  const [localEditorState, setLocalEditorState] = useState(() => {
    if (controlledEditorState) return controlledEditorState;
    if (initialContent && typeof initialContent === 'object') {
      try {
        return EditorState.createWithContent(convertFromRaw(initialContent));
      } catch {
        return EditorState.createEmpty();
      }
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
      placeholder={placeholder}
      toolbarOnFocus={false}
      {...rest}
    />
  );
}

export default RichTextEditor;
