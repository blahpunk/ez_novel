import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { addChapter, removeChapter, selectChapter, updateChapterTitle } from '../redux/actions';
import { rawToText } from '../utils/rawToText';

const ManagerContainer = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;

  h3 {
    margin: 0;
    font-family: var(--font-display);
    color: #f4f9ff;
  }

  span {
    font-size: 0.8rem;
    color: var(--text-muted);
  }
`;

const SearchInput = styled.input`
  font-size: 0.87rem;
  padding: 9px 11px;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: min(52vh, 460px);
  overflow-y: auto;
  padding-right: 2px;
`;

const ChapterCard = styled.button`
  display: block;
  width: 100%;
  text-align: left;
  border-radius: 12px;
  border: 1px solid ${({ active }) => (active ? 'rgba(45, 212, 191, 0.64)' : 'rgba(255, 255, 255, 0.12)')};
  background: ${({ active }) => (active ? 'rgba(45, 212, 191, 0.14)' : 'rgba(255, 255, 255, 0.03)')};
  padding: 10px;
`;

const ChapterTitle = styled.div`
  font-size: 0.9rem;
  font-weight: 700;
  color: #ffffff;
`;

const ChapterMeta = styled.div`
  margin-top: 4px;
  font-size: 0.76rem;
  color: var(--text-muted);
`;

const ChapterActions = styled.div`
  margin-top: 8px;
  display: flex;
  gap: 6px;
`;

const TinyButton = styled.button`
  font-size: 0.72rem;
  font-weight: 700;
  border-radius: 9px;
  padding: 6px 8px;
`;

const GhostButton = styled(TinyButton)`
  color: var(--text-secondary);
  border-color: rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.04);
`;

const DangerButton = styled(TinyButton)`
  color: #ffd8d8;
  border-color: rgba(239, 68, 68, 0.38);
  background: rgba(239, 68, 68, 0.18);
`;

const EditorRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Row = styled.div`
  display: flex;
  gap: 6px;
`;

const AddBlock = styled.div`
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  padding: 10px;
`;

const countWords = (text) => {
  if (!text) return 0;
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
};

function ChaptersManager({ onChapterPicked }) {
  const dispatch = useDispatch();
  const selectedBook = useSelector((state) => state.books.find((book) => book.id === state.selectedBookId));
  const chapters = selectedBook ? selectedBook.chapters : [];
  const selectedChapterId = selectedBook ? selectedBook.selectedChapterId : null;

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [query, setQuery] = useState('');

  const currentChapterTitle = useMemo(() => {
    if (!selectedChapterId) return '';
    const current = chapters.find((chapter) => chapter.id === selectedChapterId);
    return current ? current.title : '';
  }, [selectedChapterId, chapters]);

  useEffect(() => {
    if (!editingId) {
      setEditTitle(currentChapterTitle);
    }
  }, [currentChapterTitle, editingId]);

  const filteredChapters = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return chapters;
    return chapters.filter((chapter) => chapter.title.toLowerCase().includes(normalized));
  }, [chapters, query]);

  const handleAddChapter = () => {
    dispatch(addChapter(newChapterTitle.trim() ? newChapterTitle.trim() : null));
    setNewChapterTitle('');
  };

  const handleSelectChapter = (chapterId) => {
    dispatch(selectChapter(chapterId));
    if (onChapterPicked) {
      onChapterPicked(chapterId);
    }
  };

  const startEditing = (chapter) => {
    setEditingId(chapter.id);
    setEditTitle(chapter.title);
  };

  const handleSaveEdit = (chapterId) => {
    dispatch(updateChapterTitle(chapterId, editTitle || 'Untitled chapter'));
    setEditingId(null);
  };

  return (
    <ManagerContainer>
      <PanelHeader>
        <h3>Chapter Map</h3>
        <span>{chapters.length} total</span>
      </PanelHeader>

      <SearchInput
        type="search"
        placeholder="Search chapters"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />

      <List>
        {filteredChapters.map((chapter) => {
          const words = countWords(rawToText(chapter.content));
          const isActive = chapter.id === selectedChapterId;

          if (editingId === chapter.id) {
            return (
              <ChapterCard key={chapter.id} as="div" active={isActive ? 1 : 0}>
                <EditorRow>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(event) => setEditTitle(event.target.value)}
                    placeholder="Chapter title"
                  />
                  <Row>
                    <TinyButton onClick={() => handleSaveEdit(chapter.id)}>Save</TinyButton>
                    <GhostButton onClick={() => setEditingId(null)}>Cancel</GhostButton>
                  </Row>
                </EditorRow>
              </ChapterCard>
            );
          }

          return (
            <ChapterCard key={chapter.id} active={isActive ? 1 : 0} onClick={() => handleSelectChapter(chapter.id)}>
              <ChapterTitle>{chapter.title}</ChapterTitle>
              <ChapterMeta>{words.toLocaleString()} words</ChapterMeta>
              <ChapterActions>
                <GhostButton
                  onClick={(event) => {
                    event.stopPropagation();
                    startEditing(chapter);
                  }}
                >
                  Rename
                </GhostButton>
                <DangerButton
                  onClick={(event) => {
                    event.stopPropagation();
                    dispatch(removeChapter(chapter.id));
                  }}
                >
                  Remove
                </DangerButton>
              </ChapterActions>
            </ChapterCard>
          );
        })}
      </List>

      <AddBlock>
        <input
          type="text"
          placeholder="New chapter title (optional)"
          value={newChapterTitle}
          onChange={(event) => setNewChapterTitle(event.target.value)}
        />
        <TinyButton style={{ marginTop: '8px' }} onClick={handleAddChapter}>
          Add Chapter
        </TinyButton>
      </AddBlock>
    </ManagerContainer>
  );
}

export default ChaptersManager;
