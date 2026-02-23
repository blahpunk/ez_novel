// client/src/components/Editor.js
import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { updateChapterContent } from '../redux/actions';
import RichTextEditor from './RichTextEditor';
import { EditorState, convertFromRaw, convertToRaw } from 'draft-js';

const EditorWrapper = styled.div`
  flex: 1; /* Fill vertical space in its parent */
  display: flex;
  flex-direction: column;
`;

function EditorComponent() {
  const dispatch = useDispatch();
  const { books, selectedBookId } = useSelector((state) => ({
    books: state.books,
    selectedBookId: state.selectedBookId,
  }));

  // 1) Find the current book & chapter.
  const currentBook = books.find((b) => b.id === selectedBookId);
  if (!currentBook || !currentBook.chapters || currentBook.chapters.length === 0) {
    return (
      <div style={{ color: '#fff', padding: '20px' }}>
        No chapter available. Please add a chapter.
      </div>
    );
  }
  const currentChapter =
    currentBook.chapters.find((c) => c.id === currentBook.selectedChapterId) ||
    currentBook.chapters[0];

  // 2) Extract the raw saved content (if any).
  const rawSavedContent =
    currentChapter.content &&
    typeof currentChapter.content === 'object' &&
    Object.keys(currentChapter.content).length > 0
      ? currentChapter.content
      : null;

  // 3) Initialize local editor state from the saved content (or empty).
  const [editorState, setEditorState] = useState(() =>
    rawSavedContent
      ? EditorState.createWithContent(convertFromRaw(rawSavedContent))
      : EditorState.createEmpty()
  );

  // Track the current chapter ID so we can reinitialize if user selects a different chapter.
  const prevChapterId = useRef(currentChapter.id);
  useEffect(() => {
    if (currentChapter.id !== prevChapterId.current) {
      const newEditorState = rawSavedContent
        ? EditorState.createWithContent(convertFromRaw(rawSavedContent))
        : EditorState.createEmpty();
      setEditorState(newEditorState);
      prevChapterId.current = currentChapter.id;
    }
  }, [currentChapter, rawSavedContent]);

  // NEW EFFECT: If the raw saved content (from Redux) changes—even when the chapter id is the same—
  // update the local editor state if it differs from what we’re currently displaying.
  useEffect(() => {
    if (rawSavedContent) {
      const localRaw = convertToRaw(editorState.getCurrentContent());
      if (JSON.stringify(localRaw) !== JSON.stringify(rawSavedContent)) {
        const newEditorState = EditorState.createWithContent(convertFromRaw(rawSavedContent));
        setEditorState(newEditorState);
      }
    }
  }, [rawSavedContent]);

  // 4) Dispatch updateChapterContent only when the editor state actually changes.
  const prevRawContent = useRef(rawSavedContent || null);
  useEffect(() => {
    const rawLocal = convertToRaw(editorState.getCurrentContent());
    const lastKnown = prevRawContent.current || rawSavedContent;
    if (JSON.stringify(rawLocal) !== JSON.stringify(lastKnown)) {
      dispatch(updateChapterContent(currentChapter.id, rawLocal));
      prevRawContent.current = rawLocal;
    }
  }, [editorState, currentChapter.id, dispatch, rawSavedContent]);

  const toolbarConfig = {
    options: ['inline', 'fontSize', 'list', 'textAlign', 'link', 'history'],
    inline: { inDropdown: false, options: ['bold', 'italic', 'underline'] },
    fontSize: { inDropdown: false, options: [8, 9, 10, 11, 12, 14, 16, 18, 24] },
  };

  return (
    <EditorWrapper>
      <h2 style={{ textAlign: 'center', color: '#fff' }}>{currentChapter.title}</h2>
      <RichTextEditor
        editorState={editorState}
        onEditorStateChange={setEditorState}
        placeholder="Start writing your chapter..."
        toolbarConfig={toolbarConfig}
        wrapperStyle={{ flex: 1 }}
        editorStyle={{
          padding: '10px',
          height: '100%',
          backgroundColor: '#1e1e1e',
          color: '#e0e0e0',
          border: '1px solid #444',
          fontSize: '16px',
          lineHeight: '1.2',
        }}
      />
    </EditorWrapper>
  );
}

export default EditorComponent;
