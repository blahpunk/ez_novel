import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addBook, removeBook, selectBook, selectChapter, updateBookTitle } from '../redux/actions';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { rawToText } from '../utils/rawToText';

const PageShell = styled.section`
  display: flex;
  flex-direction: column;
  gap: 14px;
  animation: fadeInUp 300ms ease both;
`;

const Hero = styled.div`
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  background: rgba(7, 13, 24, 0.7);
  box-shadow: var(--shadow-soft);
  padding: 16px;

  h2 {
    margin: 0;
    color: #f8fbff;
    font-family: var(--font-display);
  }

  p {
    margin: 5px 0 0;
    color: var(--text-muted);
  }
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 14px;

  @media (max-width: 1080px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const BookList = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 900px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const BookCard = styled.article`
  border: 1px solid ${({ active }) => (active ? 'rgba(45, 212, 191, 0.58)' : 'rgba(255, 255, 255, 0.12)')};
  border-radius: 14px;
  background: ${({ active }) => (active ? 'rgba(45, 212, 191, 0.1)' : 'rgba(7, 12, 22, 0.72)')};
  box-shadow: var(--shadow-soft);
  padding: 12px;
  cursor: pointer;
`;

const BookHead = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
`;

const BookTitle = styled.h3`
  margin: 0;
  color: #f8fbff;
  font-size: 1rem;
`;

const Meta = styled.div`
  margin-top: 6px;
  color: var(--text-muted);
  font-size: 0.78rem;
`;

const ChapterList = styled.div`
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const ChapterPill = styled.button`
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-secondary);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 999px;
  font-size: 0.75rem;
  padding: 7px 10px;
`;

const TinyButton = styled.button`
  padding: 7px 9px;
  border-radius: 9px;
  font-size: 0.73rem;
`;

const GhostButton = styled(TinyButton)`
  color: var(--text-secondary);
  border-color: rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.05);
`;

const DangerButton = styled(TinyButton)`
  color: #fee2e2;
  border: 1px solid rgba(239, 68, 68, 0.66);
  background: rgba(153, 27, 27, 0.4);
`;

const CardActions = styled.div`
  display: flex;
  gap: 6px;
`;

const DeletePanel = styled.div`
  margin-top: 10px;
  border: 1px solid rgba(239, 68, 68, 0.5);
  border-radius: 12px;
  padding: 10px;
  background: rgba(127, 29, 29, 0.2);
  cursor: default;
`;

const DeleteHeading = styled.h4`
  margin: 0;
  color: #fecaca;
  font-size: 0.92rem;
`;

const DeleteText = styled.p`
  margin: 6px 0 0;
  font-size: 0.78rem;
  color: #fee2e2;

  code {
    color: #fff;
    font-weight: 700;
  }
`;

const DeleteList = styled.ul`
  margin: 8px 0 0;
  padding-left: 18px;
  color: #fee2e2;
  font-size: 0.77rem;
`;

const DeleteInput = styled.input`
  margin-top: 8px;
  width: 100%;
`;

const DeleteActions = styled.div`
  margin-top: 8px;
  display: flex;
  gap: 6px;
`;

const AddPanel = styled.aside`
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  background: rgba(7, 12, 22, 0.72);
  box-shadow: var(--shadow-soft);
  padding: 12px;
  height: fit-content;

  h3 {
    margin: 0 0 6px;
    color: #f8fbff;
    font-family: var(--font-display);
  }

  p {
    margin: 0 0 10px;
    color: var(--text-muted);
    font-size: 0.84rem;
  }
`;

const countWords = (text) => {
  if (!text) return 0;
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
};

function BooksPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const books = useSelector((state) => state.books);
  const selectedBookId = useSelector((state) => state.selectedBookId);

  const [newBookTitle, setNewBookTitle] = useState('');

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

  return (
    <PageShell>
      <Hero>
        <h2>Manuscript Library</h2>
        <p>Create books, switch context instantly, and jump directly into chapter drafting.</p>
      </Hero>

      <Layout>
        <BookList>
          {books.map((book) => (
            <BookCardComponent
              key={book.id}
              book={book}
              active={book.id === selectedBookId}
              onSelectBook={handleSelectBook}
              onChapterSelect={handleSelectChapter}
            />
          ))}
        </BookList>

        <AddPanel>
          <h3>New Book</h3>
          <p>Start a new manuscript with one click.</p>
          <input
            type="text"
            placeholder="Book title"
            value={newBookTitle}
            onChange={(event) => setNewBookTitle(event.target.value)}
          />
          <TinyButton style={{ marginTop: '8px' }} onClick={handleAddBook}>
            Add Book
          </TinyButton>
        </AddPanel>
      </Layout>
    </PageShell>
  );
}

function BookCardComponent({ book, active, onSelectBook, onChapterSelect }) {
  const dispatch = useDispatch();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deletePhrase, setDeletePhrase] = useState('');
  const [editedTitle, setEditedTitle] = useState(book.title);

  const chapters = Array.isArray(book.chapters) ? book.chapters : [];
  const chapterDetails = chapters.map((chapter) => ({
    id: chapter.id,
    title: chapter.title || `Chapter ${chapter.id}`,
    words: countWords(rawToText(chapter.content)),
  }));
  const words = chapterDetails.reduce((total, chapter) => total + chapter.words, 0);

  const characters = Array.isArray(book.characters) ? book.characters : [];
  const locations = Array.isArray(book.locations) ? book.locations : [];
  const plotPoints = Array.isArray(book.plotPoints) ? book.plotPoints : [];

  const canDelete = deletePhrase === 'DELETE';

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
    <BookCard
      active={active ? 1 : 0}
      onClick={() => onSelectBook(book.id)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelectBook(book.id);
        }
      }}
      role="button"
      tabIndex={0}
    >
      <BookHead>
        {editing ? (
          <>
            <input
              type="text"
              value={editedTitle}
              onChange={(event) => setEditedTitle(event.target.value)}
              onClick={(event) => event.stopPropagation()}
            />
            <TinyButton
              onClick={(event) => {
                event.stopPropagation();
                handleSave();
              }}
            >
              Save
            </TinyButton>
            <GhostButton
              onClick={(event) => {
                event.stopPropagation();
                setEditing(false);
              }}
            >
              Cancel
            </GhostButton>
          </>
        ) : (
          <>
            <BookTitle>{book.title}</BookTitle>
            <CardActions>
              <GhostButton
                onClick={(event) => {
                  event.stopPropagation();
                  setConfirmDelete(false);
                  setDeletePhrase('');
                  setEditedTitle(book.title);
                  setEditing(true);
                }}
              >
                Rename
              </GhostButton>
              <DangerButton
                onClick={(event) => {
                  event.stopPropagation();
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
            </CardActions>
          </>
        )}
      </BookHead>

      <Meta>
        {chapters.length} chapters | {words.toLocaleString()} words
      </Meta>

      {confirmDelete && (
        <DeletePanel
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <DeleteHeading>Are you SURE?</DeleteHeading>
          <DeleteText>
            Type <code>DELETE</code> in all caps to permanently remove this manuscript and all related data.
          </DeleteText>
          <DeleteList>
            <li>Book: {book.title}</li>
            <li>Total words: {words.toLocaleString()}</li>
            <li>Chapters to delete: {chapters.length}</li>
            <li>Characters to delete: {characters.length}</li>
            <li>Locations to delete: {locations.length}</li>
            <li>Plot points to delete: {plotPoints.length}</li>
          </DeleteList>
          <DeleteList>
            {chapterDetails.length > 0 ? (
              chapterDetails.map((chapter) => (
                <li key={chapter.id}>
                  Chapter "{chapter.title}" - {chapter.words.toLocaleString()} words
                </li>
              ))
            ) : (
              <li>No chapters</li>
            )}
          </DeleteList>
          <DeleteList>
            {characters.length > 0 ? (
              characters.map((character) => <li key={character.id}>Character: {character.name || 'Unnamed character'}</li>)
            ) : (
              <li>No characters</li>
            )}
          </DeleteList>
          <DeleteList>
            {locations.length > 0 ? (
              locations.map((location) => <li key={location.id}>Location: {location.name || 'Unnamed location'}</li>)
            ) : (
              <li>No locations</li>
            )}
          </DeleteList>
          <DeleteList>
            {plotPoints.length > 0 ? (
              plotPoints.map((plotPoint) => <li key={plotPoint.id}>Plot point: {plotPoint.text || 'Untitled plot point'}</li>)
            ) : (
              <li>No plot points</li>
            )}
          </DeleteList>
          <DeleteInput
            type="text"
            placeholder="Type DELETE to confirm"
            value={deletePhrase}
            onChange={(event) => setDeletePhrase(event.target.value)}
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
          />
          <DeleteActions>
            <DangerButton
              onClick={(event) => {
                event.stopPropagation();
                handleDelete();
              }}
              disabled={!canDelete}
            >
              Permanently Delete
            </DangerButton>
            <GhostButton
              onClick={(event) => {
                event.stopPropagation();
                setConfirmDelete(false);
                setDeletePhrase('');
              }}
            >
              Cancel
            </GhostButton>
          </DeleteActions>
        </DeletePanel>
      )}

      <ChapterList>
        {chapters.map((chapter) => (
          <ChapterPill
            key={chapter.id}
            onClick={(event) => {
              event.stopPropagation();
              onChapterSelect(book.id, chapter.id);
            }}
          >
            {chapter.title}
          </ChapterPill>
        ))}
      </ChapterList>
    </BookCard>
  );
}

export default BooksPage;
