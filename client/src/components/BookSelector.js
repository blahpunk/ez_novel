import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addBook, selectBook, updateBookTitle } from '../redux/actions';
import styled from 'styled-components';

const SelectorContainer = styled.div`
  padding: 10px;
  background-color: #222;
  color: #fff;
  margin-bottom: 10px;
`;

const TitleList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const TitleItem = styled.li`
  padding: 5px;
  cursor: pointer;
  color: ${(props) => (props.selected ? '#00ff99' : '#fff')};
  &:hover {
    color: #00ff99;
  }
`;

const TitleInput = styled.input`
  padding: 5px;
  font-size: 1rem;
  width: 100%;
  margin-top: 5px;
`;

const Button = styled.button`
  margin-top: 5px;
  padding: 5px 10px;
  font-size: 0.9rem;
  background: #00ff99;
  color: #121212;
  border: none;
  border-radius: 3px;
  cursor: pointer;
`;

const CurrentBookContainer = styled.div`
  margin-top: 10px;
`;

function BookSelector() {
  const dispatch = useDispatch();
  const books = useSelector((state) => state.books);
  const selectedBookId = useSelector((state) => state.selectedBookId);
  
  const selectedBookTitle = useMemo(() => {
    const selected = books.find((b) => b.id === selectedBookId);
    return selected ? selected.title : '';
  }, [selectedBookId, books]);

  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [newBookTitle, setNewBookTitle] = useState('');

  useEffect(() => {
    if (!isEditing) {
      setEditedTitle(selectedBookTitle);
    }
  }, [selectedBookTitle, isEditing]);

  const handleSelectBook = (id) => {
    dispatch(selectBook(id));
  };

  const handleSaveEdit = () => {
    dispatch(updateBookTitle(selectedBookId, editedTitle));
    setIsEditing(false);
  };

  const handleAddBook = () => {
    if (newBookTitle.trim()) {
      dispatch(addBook(newBookTitle));
      setNewBookTitle('');
    }
  };

  return (
    <SelectorContainer>
      <h3>Books</h3>
      <TitleList>
        {books.map((book) => (
          <TitleItem
            key={book.id}
            selected={book.id === selectedBookId}
            onClick={() => handleSelectBook(book.id)}
          >
            {book.title}
          </TitleItem>
        ))}
      </TitleList>
      {selectedBookId && (
        <CurrentBookContainer>
          {isEditing ? (
            <>
              <TitleInput
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
              />
              <Button onClick={handleSaveEdit}>Save</Button>
              <Button onClick={() => setIsEditing(false)}>Cancel</Button>
            </>
          ) : (
            <>
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                {selectedBookTitle}
              </div>
              <Button onClick={() => setIsEditing(true)}>Edit Title</Button>
            </>
          )}
        </CurrentBookContainer>
      )}
      <div style={{ marginTop: '10px' }}>
        <TitleInput
          type="text"
          placeholder="New Book Title"
          value={newBookTitle}
          onChange={(e) => setNewBookTitle(e.target.value)}
        />
        <Button onClick={handleAddBook}>Add Book</Button>
      </div>
    </SelectorContainer>
  );
}

export default BookSelector;
