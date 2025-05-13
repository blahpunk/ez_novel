// client/src/components/ChaptersManager.js
import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { addChapter, removeChapter, selectChapter, updateChapterTitle } from '../redux/actions';

const ManagerContainer = styled.div`
  margin-bottom: 20px;
  border-bottom: 1px solid #333;
  padding-bottom: 10px;
`;

const ChapterItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
  cursor: pointer;
  color: ${(props) => (props.active ? '#00ff99' : '#e0e0e0')};
  &:hover {
    color: #00ff99;
  }
`;

const Input = styled.input`
  padding: 5px;
  font-size: 0.9rem;
  width: 100%;
  margin-top: 5px;
`;

const Button = styled.button`
  padding: 5px 8px;
  font-size: 0.8rem;
  background: #00ff99;
  color: #121212;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  margin-left: 5px;
`;

function ChaptersManager() {
  const dispatch = useDispatch();
  const selectedBook = useSelector((state) =>
    state.books.find((b) => b.id === state.selectedBookId)
  );
  const chapters = selectedBook ? selectedBook.chapters : [];
  const selectedChapterId = selectedBook ? selectedBook.selectedChapterId : null;

  // Local state for editing a chapter title
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  // Local state for adding a new chapter with an optional custom title.
  const [newChapterTitle, setNewChapterTitle] = useState('');

  // Memoize the current chapter title from the store.
  const currentChapterTitle = useMemo(() => {
    if (selectedChapterId) {
      const ch = chapters.find((c) => c.id === selectedChapterId);
      return ch ? ch.title : '';
    }
    return '';
  }, [selectedChapterId, chapters]);

  // Only update the local editTitle when the selected chapter changes and we're not editing.
  useEffect(() => {
    if (!editingId && currentChapterTitle !== editTitle) {
      setEditTitle(currentChapterTitle);
    }
  }, [currentChapterTitle, editingId, editTitle]);

  const handleAddChapter = () => {
    // Dispatch addChapter with custom title if provided; otherwise, pass null.
    dispatch(addChapter(newChapterTitle.trim() ? newChapterTitle.trim() : null));
    setNewChapterTitle('');
  };

  const handleSelectChapter = (id) => {
    dispatch(selectChapter(id));
  };

  const startEditing = (chapter) => {
    setEditingId(chapter.id);
    setEditTitle(chapter.title);
  };

  const handleSaveEdit = (id) => {
    dispatch(updateChapterTitle(id, editTitle));
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    // Reset local editTitle to the current chapter title
    setEditTitle(currentChapterTitle);
  };

  return (
    <ManagerContainer>
      <h3>Chapters</h3>
      {chapters.map((chapter) => (
        <ChapterItem
          key={chapter.id}
          active={chapter.id === selectedChapterId}
          onClick={() => handleSelectChapter(chapter.id)}
        >
          {editingId === chapter.id ? (
            <>
              <Input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
              <div>
                <Button onClick={() => handleSaveEdit(chapter.id)}>Save</Button>
                <Button onClick={handleCancelEdit}>Cancel</Button>
              </div>
            </>
          ) : (
            <>
              <span>{chapter.title}</span>
              <div>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    startEditing(chapter);
                  }}
                >
                  Edit
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch(removeChapter(chapter.id));
                  }}
                >
                  X
                </Button>
              </div>
            </>
          )}
        </ChapterItem>
      ))}
      <div style={{ marginTop: '10px' }}>
        <Input
          type="text"
          placeholder="Custom Chapter Title (optional)"
          value={newChapterTitle}
          onChange={(e) => setNewChapterTitle(e.target.value)}
        />
        <Button onClick={handleAddChapter}>Add Chapter</Button>
      </div>
    </ManagerContainer>
  );
}

export default ChaptersManager;
