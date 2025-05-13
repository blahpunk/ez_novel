import React from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';

const MenuBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #222;
  padding: 10px 20px;
  color: #fff;
`;

const ActiveBook = styled.div`
  font-size: 1rem;
`;

const MenuButtons = styled.div`
  display: flex;
  gap: 10px;
`;

const MenuButton = styled(Link)`
  text-decoration: none;
  color: ${(props) => (props.active ? '#00ff99' : '#fff')};
  font-size: 1rem;
  padding: 5px 10px;
  border-radius: 3px;
  background-color: transparent;
  
  &:hover {
    color: #00ff99;
  }
`;

function TopMenu() {
  const location = useLocation();
  const selectedBook = useSelector((state) =>
    state.books.find((b) => b.id === state.selectedBookId)
  );
  const activeBookTitle = selectedBook ? selectedBook.title : 'No Book Selected';

  return (
    <MenuBar>
      <ActiveBook>
        <strong>Active Book:</strong> {activeBookTitle}
      </ActiveBook>
      <MenuButtons>
        <MenuButton to="/books" active={location.pathname === '/books' ? 1 : 0}>
          Books
        </MenuButton>
        <MenuButton to="/chapters" active={location.pathname === '/chapters' ? 1 : 0}>
          Chapters
        </MenuButton>
        <MenuButton to="/characters" active={location.pathname === '/characters' ? 1 : 0}>
          Characters
        </MenuButton>
        <MenuButton to="/plots" active={location.pathname === '/plots' ? 1 : 0}>
          Plots
        </MenuButton>
        <MenuButton to="/locations" active={location.pathname === '/locations' ? 1 : 0}>
          Locations
        </MenuButton>
      </MenuButtons>
    </MenuBar>
  );
}

export default TopMenu;
