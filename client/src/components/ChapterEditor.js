// client/src/components/ChapterEditor.js
import React, { useState, useEffect } from 'react';
import { Editor, EditorState, convertFromRaw, convertToRaw } from 'draft-js';
import { useDebounce } from '../hooks/useDebounce';
import 'draft-js/dist/Draft.css';
import styled from 'styled-components';

const EditorContainer = styled.div`
  flex: 1; /* Allow this container to grow and fill available space */
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: #2e2e2e;
  padding: 20px;
  border: 1px solid #444;
  border-radius: 5px;
  font-size: 16px;
`;

const EditorWrapper = styled.div`
  flex: 1; /* Fill remaining vertical space */
  display: flex;
`;

export default function ChapterEditor({ chapter, onSave }) {
  // Initialize editor state from the chapter's content.
  const [editorState, setEditorState] = useState(() => {
    if (chapter.content && typeof chapter.content === 'object' && Object.keys(chapter.content).length > 0) {
      return EditorState.createWithContent(convertFromRaw(chapter.content));
    }
    return EditorState.createEmpty();
  });

  // Debounce the editor state changes (1 second delay).
  const debouncedState = useDebounce(editorState, 1000);

  useEffect(() => {
    const content = debouncedState.getCurrentContent();
    onSave(convertToRaw(content));
  }, [debouncedState, onSave]);

  return (
    <EditorContainer>
      <EditorWrapper>
        <Editor
          editorState={editorState}
          onChange={setEditorState}
          placeholder="Start writing your chapter..."
        />
      </EditorWrapper>
    </EditorContainer>
  );
}
