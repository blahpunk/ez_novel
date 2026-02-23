import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addBook, selectBook, selectChapter, updateBookTitle } from '../redux/actions';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const PageContainer = styled.div`
  padding: 40px;
  background-color: #181818;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const BookList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;
  max-width: 800px;
`;

const BookListItem = styled.li`
  background-color: #222;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: 0.3s;
  &:hover {
    transform: scale(1.02);
  }
`;

const TitleDisplay = styled.div`
  font-size: 1.2rem;
  color: #00ff99;
  margin-bottom: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const TitleInput = styled.input`
  padding: 5px;
  font-size: 1.2rem;
  background-color: #2e2e2e;
  color: #fff;
  border: 1px solid #444;
  width: 70%;
`;

const EditButton = styled.button`
  padding: 5px 10px;
  background-color: #00ff99;
  color: #121212;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 0.9rem;
  margin-left: 10px;
`;

const ChapterList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ChapterListItem = styled.li`
  padding: 8px 10px;
  background-color: #333;
  margin-bottom: 5px;
  cursor: pointer;
  border-radius: 5px;
  text-align: center;
  &:hover {
    background-color: #00ff99;
    color: black;
  }
`;

const NewBookForm = styled.div`
  margin-top: 30px;
  background-color: #222;
  border: 1px solid #444;
  padding: 20px;
  border-radius: 8px;
  width: 100%;
  max-width: 400px;
`;

const NewBookInput = styled.input`
  padding: 8px;
  font-size: 1rem;
  width: 100%;
  margin-bottom: 10px;
  background-color: #2e2e2e;
  color: #e0e0e0;
  border: 1px solid #444;
`;

const Button = styled.button`
  padding: 8px 12px;
  font-size: 1rem;
  background-color: #00ff99;
  color: #121212;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background-color: #00cc77;
  }
`;

function BooksPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const books = useSelector((state) => state.books);
  const selectedBookId = useSelector((state) => state.selectedBookId);
  
  const [newBookTitle, setNewBookTitle] = useState('');

  // Clicking a book sets it active
  const handleSelectBook = (bookId) => {
    dispatch(selectBook(bookId));
  };

  // Clicking a chapter sets the active book and chapter and navigates to Chapters page
  const handleSelectChapter = (bookId, chapterId) => {
    dispatch(selectBook(bookId));
    dispatch(selectChapter(chapterId));
    navigate('/chapters');
  };

  const handleAddBook = () => {
    if (newBookTitle.trim()) {
      dispatch(addBook(newBookTitle.trim()));
      setNewBookTitle('');
    }
  };

  return (
    <PageContainer>
      <h2 style={{ color: '#fff' }}>Books</h2>
      <BookList>
        {books.map((book) => (
          <BookCardComponent key={book.id} book={book} onSelectBook={handleSelectBook} onChapterSelect={handleSelectChapter} />
        ))}
      </BookList>
      <NewBookForm>
        <h3 style={{ color: '#fff', textAlign: 'center' }}>Add New Book</h3>
        <NewBookInput
          type="text"
          placeholder="Book Title"
          value={newBookTitle}
          onChange={(e) => setNewBookTitle(e.target.value)}
        />
        <Button onClick={handleAddBook}>Add Book</Button>
      </NewBookForm>
    </PageContainer>
  );
}

function BookCardComponent({ book, onSelectBook, onChapterSelect }) {
  const dispatch = useDispatch();
  const [editing, setEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(book.title);

  const handleSave = () => {
    dispatch(updateBookTitle(book.id, editedTitle));
    setEditing(false);
  };

  return (
    <BookListItem onClick={() => onSelectBook(book.id)}>
      <TitleDisplay>
        {editing ? (
          <>
            <TitleInput
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
            <EditButton onClick={(e) => { e.stopPropagation(); handleSave(); }}>Save</EditButton>
            <EditButton onClick={(e) => { e.stopPropagation(); setEditing(false); }}>Cancel</EditButton>
          </>
        ) : (
          <>
            <span>{book.title}</span>
            <EditButton onClick={(e) => { e.stopPropagation(); setEditedTitle(book.title); setEditing(true); }}>
              Edit
            </EditButton>
          </>
        )}
      </TitleDisplay>
      <ChapterList>
        {book.chapters &&
          book.chapters.map((chapter) => (
            <ChapterListItem
              key={chapter.id}
              onClick={(e) => {
                e.stopPropagation();
                onChapterSelect(book.id, chapter.id);
              }}
            >
              {chapter.title}
            </ChapterListItem>
          ))}
      </ChapterList>
    </BookListItem>
  );
}


export default BooksPage;
