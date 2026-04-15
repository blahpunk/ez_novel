import React, { useEffect, useRef, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addBook, importBook, removeBook, reorderBooks, selectBook, selectChapter, updateBookTitle } from '../redux/actions';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { rawToText } from '../utils/rawToText';
import { parseBackupFile } from '../utils/backupFile';

const PageShell = styled.section`
  display: flex;
  flex-direction: column;
  gap: 18px;
  animation: fadeInUp 300ms ease both;
`;

const Hero = styled.section`
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 22px;
  padding: 22px;
  background:
    radial-gradient(circle at top left, rgba(45, 212, 191, 0.18), rgba(45, 212, 191, 0) 44%),
    radial-gradient(circle at bottom right, rgba(245, 158, 11, 0.18), rgba(245, 158, 11, 0) 40%),
    rgba(7, 13, 24, 0.82);
  box-shadow: var(--shadow-soft);

  h2 {
    margin: 0;
    color: #f8fbff;
    font-family: var(--font-display);
    font-size: clamp(1.4rem, 2.4vw, 2.1rem);
  }

  p {
    margin: 8px 0 0;
    max-width: 60ch;
    color: var(--text-muted);
    line-height: 1.5;
  }
`;

const HeroTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;

  @media (max-width: 720px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const HeroActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: stretch;

  @media (max-width: 720px) {
    width: 100%;
  }
`;

const LibraryStats = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
`;

const StatChip = styled.div`
  border-radius: 999px;
  padding: 8px 12px;
  color: #e6f5f7;
  font-size: 0.82rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);

  strong {
    color: #fff;
  }
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(300px, 0.8fr);
  gap: 16px;

  @media (max-width: 1080px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FeaturedPanel = styled.section`
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  background: rgba(7, 12, 22, 0.76);
  box-shadow: var(--shadow-soft);
  padding: 20px;
`;

const FeaturedIntro = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;

  @media (max-width: 720px) {
    flex-direction: column;
  }
`;

const Eyebrow = styled.div`
  color: #7dd3c7;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 0.72rem;
  font-weight: 700;
`;

const FeaturedTitle = styled.h3`
  margin: 6px 0 0;
  color: #f8fbff;
  font-family: var(--font-display);
  font-size: clamp(1.35rem, 2.8vw, 2rem);
`;

const FeaturedBlurb = styled.p`
  margin: 10px 0 0;
  color: var(--text-muted);
  max-width: 58ch;
  line-height: 1.55;
`;

const FeaturedMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
  color: var(--text-secondary);
  font-size: 0.82rem;
`;

const ActionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Button = styled.button`
  border-radius: 999px;
  padding: 9px 14px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 180ms ease, filter 180ms ease, border-color 180ms ease;

  &:hover {
    transform: translateY(-1px);
    filter: brightness(1.04);
  }
`;

const PrimaryButton = styled(Button)`
  border: 0;
  color: #082127;
  background: linear-gradient(135deg, #5eead4, #2dd4bf);
`;

const GhostButton = styled(Button)`
  color: var(--text-secondary);
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.05);
`;

const DangerButton = styled(Button)`
  color: #fee2e2;
  border: 1px solid rgba(239, 68, 68, 0.66);
  background: rgba(153, 27, 27, 0.4);
`;

const SectionCard = styled.section`
  border-radius: 18px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);

  h4 {
    margin: 0;
    color: #f8fbff;
    font-size: 0.95rem;
  }

  p {
    margin: 6px 0 0;
    color: var(--text-muted);
    font-size: 0.84rem;
    line-height: 1.45;
  }
`;

const UtilityRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 18px;
`;

const ChapterList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 14px;
`;

const ChapterRow = styled.button`
  width: 100%;
  text-align: left;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(8, 15, 27, 0.7);
  padding: 12px 14px;
  cursor: pointer;

  strong {
    display: block;
    color: #f8fbff;
    font-size: 0.92rem;
  }

  span {
    display: block;
    margin-top: 4px;
    color: var(--text-muted);
    font-size: 0.78rem;
  }
`;

const QuietItem = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
`;

const QuietLabel = styled.div`
  color: #f6fbff;
  font-size: 0.88rem;
`;

const QuietMeta = styled.div`
  margin-top: 3px;
  color: var(--text-muted);
  font-size: 0.76rem;
`;

const ShelfPanel = styled.aside`
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  background: rgba(7, 12, 22, 0.76);
  box-shadow: var(--shadow-soft);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: fit-content;
`;

const PanelHeader = styled.div`
  h3 {
    margin: 0;
    color: #f8fbff;
    font-family: var(--font-display);
    font-size: 1.05rem;
  }

  p {
    margin: 6px 0 0;
    color: var(--text-muted);
    font-size: 0.84rem;
    line-height: 1.45;
  }
`;

const ShelfList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ShelfItem = styled.button`
  text-align: left;
  width: 100%;
  border-radius: 16px;
  padding: 14px;
  position: relative;
  cursor: pointer;
  border: 1px solid
    ${({ active, dragover }) =>
      dragover
        ? 'rgba(94, 234, 212, 0.85)'
        : active
          ? 'rgba(45, 212, 191, 0.48)'
          : 'rgba(255, 255, 255, 0.09)'};
  background: ${({ active, dragover }) =>
    dragover
      ? 'rgba(94, 234, 212, 0.14)'
      : active
        ? 'rgba(45, 212, 191, 0.1)'
        : 'rgba(255, 255, 255, 0.04)'};
  opacity: ${({ dragging }) => (dragging ? 0.55 : 1)};

  strong {
    display: block;
    color: #f8fbff;
    font-size: 0.92rem;
  }
`;

const ShelfMeta = styled.div`
  margin-top: 6px;
  color: var(--text-muted);
  font-size: 0.78rem;
  line-height: 1.45;
`;

const AddPanel = styled.section`
  border-radius: 18px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);

  h4 {
    margin: 0;
    color: #f8fbff;
    font-size: 0.95rem;
  }

  p {
    margin: 6px 0 0;
    color: var(--text-muted);
    font-size: 0.84rem;
    line-height: 1.45;
  }
`;

const TextInput = styled.input`
  width: 100%;
  margin-top: 12px;
`;

const DeletePanel = styled.div`
  margin-top: 16px;
  border: 1px solid rgba(239, 68, 68, 0.5);
  border-radius: 16px;
  padding: 14px;
  background: rgba(127, 29, 29, 0.16);
`;

const DeleteHeading = styled.h4`
  margin: 0;
  color: #fecaca;
  font-size: 0.92rem;
`;

const DeleteBookName = styled.div`
  margin-top: 8px;
  color: #fff;
  font-size: 1.3rem;
  font-weight: 800;
  line-height: 1.2;
`;

const DeleteText = styled.p`
  margin: 6px 0 0;
  font-size: 0.82rem;
  color: #fee2e2;

  code {
    color: #fff;
    font-weight: 700;
  }
`;

const DeleteList = styled.ul`
  margin: 10px 0 0;
  padding-left: 18px;
  color: #fee2e2;
  font-size: 0.78rem;
  line-height: 1.5;
`;

const DeleteInput = styled.input`
  margin-top: 10px;
  width: 100%;
`;

const DeleteActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
`;

const EmptyPanel = styled(FeaturedPanel)`
  text-align: center;
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const countWords = (text) => {
  if (!text) return 0;
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
};

const summarizeBook = (book) => {
  const chapters = Array.isArray(book?.chapters) ? book.chapters : [];
  const chapterDetails = chapters.map((chapter) => ({
    id: chapter.id,
    title: chapter.title || `Chapter ${chapter.id}`,
    words: countWords(rawToText(chapter.content)),
  }));
  const words = chapterDetails.reduce((total, chapter) => total + chapter.words, 0);
  const characters = Array.isArray(book?.characters) ? book.characters : [];
  const locations = Array.isArray(book?.locations) ? book.locations : [];
  const plotPoints = Array.isArray(book?.plotPoints) ? book.plotPoints : [];
  const selectedChapter = chapters.find((chapter) => chapter.id === book?.selectedChapterId) || chapters[0] || null;

  return {
    chapters,
    chapterDetails,
    words,
    characters,
    locations,
    plotPoints,
    selectedChapter,
  };
};

function BooksPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const books = useSelector((state) => state.books);
  const selectedBookId = useSelector((state) => state.selectedBookId);
  const [newBookTitle, setNewBookTitle] = useState('');
  const [draggedBookId, setDraggedBookId] = useState(null);
  const [dragOverBookId, setDragOverBookId] = useState(null);
  const importInputRef = useRef(null);

  const selectedBook = useMemo(
    () => books.find((book) => book.id === selectedBookId) || books[0] || null,
    [books, selectedBookId]
  );

  const libraryStats = useMemo(() => {
    const totals = books.reduce(
      (accumulator, book) => {
        const summary = summarizeBook(book);
        return {
          books: accumulator.books + 1,
          chapters: accumulator.chapters + summary.chapters.length,
          words: accumulator.words + summary.words,
        };
      },
      { books: 0, chapters: 0, words: 0 }
    );

    return totals;
  }, [books]);

  const handleSelectBook = (bookId) => {
    dispatch(selectBook(bookId));
  };

  const handleSelectChapter = (bookId, chapterId) => {
    dispatch(selectBook(bookId));
    dispatch(selectChapter(chapterId));
    navigate('/chapters');
  };

  const handleAddBook = () => {
    if (!newBookTitle.trim()) return;
    dispatch(addBook(newBookTitle.trim()));
    setNewBookTitle('');
  };

  const handleQuickAddBook = () => {
    const title = 'Untitled Novel';
    dispatch(addBook(title));
  };

  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  const handleImportBackup = async (event) => {
    const [file] = event.target.files || [];
    event.target.value = '';
    if (!file) return;

    try {
      const importedBook = await parseBackupFile(file);
      dispatch(importBook(importedBook));
    } catch (error) {
      window.alert(error.message || 'Import failed.');
    }
  };

  const handleShelfDrop = (targetBookId) => {
    if (!draggedBookId || draggedBookId === targetBookId) {
      setDraggedBookId(null);
      setDragOverBookId(null);
      return;
    }

    dispatch(reorderBooks(draggedBookId, targetBookId));
    setDraggedBookId(null);
    setDragOverBookId(null);
  };

  if (!selectedBook) {
    return (
      <PageShell>
        <Hero>
          <h2>Manuscript Library</h2>
          <p>A quieter home for long-form work, with one manuscript in focus and everything else off to the side.</p>
        </Hero>
        <EmptyPanel>
          <FeaturedTitle>No manuscripts yet</FeaturedTitle>
          <FeaturedBlurb>Start with a single novel and we’ll give it room to breathe.</FeaturedBlurb>
          <TextInput
            type="text"
            placeholder="Novel title"
            value={newBookTitle}
            onChange={(event) => setNewBookTitle(event.target.value)}
          />
          <ActionRow style={{ justifyContent: 'center', marginTop: '12px' }}>
            <PrimaryButton onClick={handleAddBook}>Create First Novel</PrimaryButton>
          </ActionRow>
        </EmptyPanel>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Hero>
        <HeroTop>
          <h2>Manuscript Library</h2>
          <HeroActions>
            <PrimaryButton onClick={handleQuickAddBook}>New Novel</PrimaryButton>
            <GhostButton onClick={handleImportClick}>Import Backup</GhostButton>
          </HeroActions>
        </HeroTop>
        <LibraryStats>
          <StatChip>
            <strong>{libraryStats.books}</strong> novels
          </StatChip>
          <StatChip>
            <strong>{libraryStats.chapters}</strong> chapters
          </StatChip>
          <StatChip>
            <strong>{libraryStats.words.toLocaleString()}</strong> words across the library
          </StatChip>
        </LibraryStats>
      </Hero>

      <Layout>
        <Stack>
          <FeaturedBookPanel
            book={selectedBook}
            onSelectBook={handleSelectBook}
            onChapterSelect={handleSelectChapter}
            onOpenSection={(path) => navigate(path)}
          />
        </Stack>

        <ShelfPanel>
          <PanelHeader>
            <h3>Novel Shelf</h3>
          </PanelHeader>

          <ShelfList>
            {books.map((book) => {
              const summary = summarizeBook(book);
              const active = book.id === selectedBook.id;
              return (
                <ShelfItem
                  key={book.id}
                  active={active ? 1 : 0}
                  dragging={draggedBookId === book.id ? 1 : 0}
                  dragover={dragOverBookId === book.id ? 1 : 0}
                  draggable
                  onClick={() => handleSelectBook(book.id)}
                  onDragStart={(event) => {
                    setDraggedBookId(book.id);
                    event.dataTransfer.effectAllowed = 'move';
                    event.dataTransfer.setData('text/plain', String(book.id));
                  }}
                  onDragOver={(event) => {
                    event.preventDefault();
                    if (draggedBookId && draggedBookId !== book.id) {
                      setDragOverBookId(book.id);
                    }
                  }}
                  onDragLeave={() => {
                    if (dragOverBookId === book.id) {
                      setDragOverBookId(null);
                    }
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    handleShelfDrop(book.id);
                  }}
                  onDragEnd={() => {
                    setDraggedBookId(null);
                    setDragOverBookId(null);
                  }}
                >
                  <strong>{book.title || 'Untitled Book'}</strong>
                  <ShelfMeta>
                    {summary.chapters.length} chapters · {summary.words.toLocaleString()} words
                  </ShelfMeta>
                </ShelfItem>
              );
            })}
          </ShelfList>

          <AddPanel>
            <h4>New Novel</h4>
            <p>Create a fresh manuscript without giving it equal weight until you are ready to work inside it.</p>
            <TextInput
              type="text"
              placeholder="Novel title"
              value={newBookTitle}
              onChange={(event) => setNewBookTitle(event.target.value)}
            />
            <ActionRow style={{ marginTop: '12px' }}>
              <PrimaryButton onClick={handleAddBook}>Create Novel</PrimaryButton>
            </ActionRow>
          </AddPanel>
        </ShelfPanel>
      </Layout>
      <HiddenFileInput ref={importInputRef} type="file" accept=".ezn" onChange={handleImportBackup} />
    </PageShell>
  );
}

function FeaturedBookPanel({ book, onSelectBook, onChapterSelect, onOpenSection }) {
  const dispatch = useDispatch();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deletePhrase, setDeletePhrase] = useState('');
  const [editedTitle, setEditedTitle] = useState(book.title);
  const summary = summarizeBook(book);

  useEffect(() => {
    if (!editing) {
      setEditedTitle(book.title || 'Untitled Book');
    }
  }, [book.id, book.title, editing]);

  const canDelete = deletePhrase === 'DELETE';
  const selectedChapterLabel = summary.selectedChapter?.title || 'No chapter selected yet';
  const recentChapters = summary.chapterDetails.slice(0, 4);

  const handleSave = () => {
    dispatch(updateBookTitle(book.id, editedTitle.trim() || 'Untitled Book'));
    setEditing(false);
  };

  const handleDelete = () => {
    if (!canDelete) return;
    dispatch(removeBook(book.id));
    setConfirmDelete(false);
    setDeletePhrase('');
  };

  return (
    <FeaturedPanel>
      <FeaturedIntro>
        <div>
          <Eyebrow>Current Focus</Eyebrow>
          {editing ? (
            <>
              <TextInput
                type="text"
                value={editedTitle}
                onChange={(event) => setEditedTitle(event.target.value)}
              />
              <ActionRow style={{ marginTop: '10px' }}>
                <PrimaryButton onClick={handleSave}>Save Title</PrimaryButton>
                <GhostButton
                  onClick={() => {
                    setEditing(false);
                    setEditedTitle(book.title);
                  }}
                >
                  Cancel
                </GhostButton>
              </ActionRow>
            </>
          ) : (
            <>
              <FeaturedTitle>{book.title || 'Untitled Book'}</FeaturedTitle>
              <FeaturedMeta>
                <span>{summary.chapters.length} chapters</span>
                <span>{summary.words.toLocaleString()} words</span>
                <span>{summary.characters.length} characters</span>
                <span>{summary.locations.length + summary.plotPoints.length} world notes</span>
              </FeaturedMeta>
            </>
          )}
        </div>

        {!editing && (
          <ActionRow>
            <PrimaryButton
              onClick={() => {
                onSelectBook(book.id);
                if (summary.selectedChapter) {
                  onChapterSelect(book.id, summary.selectedChapter.id);
                  return;
                }
                onOpenSection('/chapters');
              }}
            >
              Resume Writing
            </PrimaryButton>
            <GhostButton onClick={() => setEditing(true)}>Rename</GhostButton>
            <DangerButton
              onClick={() => {
                setConfirmDelete((isOpen) => {
                  const nextOpen = !isOpen;
                  if (!nextOpen) {
                    setDeletePhrase('');
                  }
                  return nextOpen;
                });
              }}
            >
              Delete
            </DangerButton>
          </ActionRow>
        )}
      </FeaturedIntro>

      <UtilityRow>
        <GhostButton onClick={() => onOpenSection('/chapters')}>Chapters</GhostButton>
        <GhostButton onClick={() => onOpenSection('/characters')}>Characters</GhostButton>
        <GhostButton onClick={() => onOpenSection('/locations')}>Locations</GhostButton>
        <GhostButton onClick={() => onOpenSection('/plot')}>Plot</GhostButton>
      </UtilityRow>

      <SectionCard>
        <h4>Recent</h4>
        <ChapterList>
          {recentChapters.length > 0 ? (
            recentChapters.map((chapter) => (
              <ChapterRow key={chapter.id} onClick={() => onChapterSelect(book.id, chapter.id)}>
                <strong>{chapter.title}</strong>
                <span>{chapter.words.toLocaleString()} words</span>
              </ChapterRow>
            ))
          ) : (
            <QuietItem>
              <div>
                <QuietLabel>No chapters yet</QuietLabel>
                <QuietMeta>Create or import a chapter to start drafting.</QuietMeta>
              </div>
            </QuietItem>
          )}
        </ChapterList>
      </SectionCard>

      {confirmDelete && (
        <DeletePanel>
          <DeleteHeading>Delete Manuscript</DeleteHeading>
          <DeleteBookName>{book.title || 'Untitled Book'}</DeleteBookName>
          <DeleteText>
            Type <code>DELETE</code> in all caps to permanently remove this manuscript and every attached chapter, character, location, and plot note.
          </DeleteText>
          <DeleteList>
            <li>Total words: {summary.words.toLocaleString()}</li>
            <li>Chapters to delete: {summary.chapters.length}</li>
            <li>Characters to delete: {summary.characters.length}</li>
            <li>Locations to delete: {summary.locations.length}</li>
            <li>Plot points to delete: {summary.plotPoints.length}</li>
          </DeleteList>
          <DeleteList>
            {summary.chapterDetails.length > 0 ? (
              summary.chapterDetails.map((chapter) => (
                <li key={chapter.id}>
                  Chapter "{chapter.title}" - {chapter.words.toLocaleString()} words
                </li>
              ))
            ) : (
              <li>No chapters</li>
            )}
          </DeleteList>
          <DeleteInput
            type="text"
            placeholder="Type DELETE to confirm"
            value={deletePhrase}
            onChange={(event) => setDeletePhrase(event.target.value)}
          />
          <DeleteActions>
            <DangerButton onClick={handleDelete} disabled={!canDelete}>
              Permanently Delete
            </DangerButton>
            <GhostButton
              onClick={() => {
                setConfirmDelete(false);
                setDeletePhrase('');
              }}
            >
              Cancel
            </GhostButton>
          </DeleteActions>
        </DeletePanel>
      )}
    </FeaturedPanel>
  );
}

export default BooksPage;
