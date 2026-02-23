import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { rawToText } from '../utils/rawToText';

const NavWrap = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(7, 12, 22, 0.88);
`;

const DesktopBar = styled.div`
  max-width: 1320px;
  margin: 0 auto;
  padding: 10px 20px 12px;
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 16px;

  @media (max-width: 980px) {
    display: none;
  }
`;

const BookContext = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`;

const ContextLabel = styled.span`
  font-size: 0.74rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--text-muted);
`;

const ContextTitle = styled.span`
  color: #fff;
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ContextMeta = styled.span`
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  padding: 4px 8px;
  color: var(--text-secondary);
  font-size: 0.75rem;
`;

const NavRow = styled.nav`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const NavPill = styled(Link)`
  text-decoration: none;
  border-radius: 999px;
  border: 1px solid ${({ active }) => (active ? 'rgba(45, 212, 191, 0.8)' : 'rgba(255, 255, 255, 0.15)')};
  background: ${({ active }) => (active ? 'rgba(45, 212, 191, 0.16)' : 'rgba(255, 255, 255, 0.04)')};
  color: ${({ active }) => (active ? '#d6fffb' : 'var(--text-secondary)')};
  padding: 7px 12px;
  font-size: 0.84rem;
  font-weight: 600;
  transition: transform 160ms ease, border-color 160ms ease, background 160ms ease;

  &:hover {
    transform: translateY(-1px);
    border-color: rgba(45, 212, 191, 0.42);
    background: rgba(45, 212, 191, 0.1);
  }
`;

const MobileDock = styled.nav`
  display: none;

  @media (max-width: 980px) {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    position: fixed;
    z-index: 60;
    left: 10px;
    right: 10px;
    bottom: 10px;
    border: 1px solid rgba(255, 255, 255, 0.13);
    border-radius: 16px;
    background: rgba(10, 17, 30, 0.92);
    backdrop-filter: blur(10px);
    box-shadow: 0 12px 34px rgba(0, 0, 0, 0.36);
    overflow: hidden;
    animation: fadeInUp 300ms ease both;
  }
`;

const DockLink = styled(Link)`
  text-decoration: none;
  color: ${({ active }) => (active ? '#9ef4e8' : 'var(--text-secondary)')};
  text-align: center;
  padding: 11px 4px 12px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  background: ${({ active }) => (active ? 'linear-gradient(180deg, rgba(45, 212, 191, 0.18), rgba(45, 212, 191, 0.03))' : 'transparent')};

  &:last-child {
    border-right: none;
  }
`;

const DockIcon = styled.div`
  display: block;
  font-size: 0.8rem;
  margin-bottom: 2px;
`;

const NAV_ITEMS = [
  { to: '/books', label: 'Books', icon: 'Bk' },
  { to: '/chapters', label: 'Chapters', icon: 'Ch' },
  { to: '/characters', label: 'Chars', icon: 'Cr' },
  { to: '/plots', label: 'Plot', icon: 'Pt' },
  { to: '/locations', label: 'Places', icon: 'Lc' },
];

const countWords = (text) => {
  if (!text) return 0;
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
};

function TopMenu() {
  const location = useLocation();

  const selectedBook = useSelector((state) => state.books.find((book) => book.id === state.selectedBookId));

  const bookWordCount = useMemo(() => {
    if (!selectedBook?.chapters?.length) return 0;
    return selectedBook.chapters.reduce((total, chapter) => {
      return total + countWords(rawToText(chapter.content));
    }, 0);
  }, [selectedBook]);

  const activeBookTitle = selectedBook ? selectedBook.title : 'No book selected';

  const isActive = (route) => {
    if (route === '/books' && (location.pathname === '/' || location.pathname === '/books')) {
      return true;
    }
    return location.pathname === route;
  };

  return (
    <NavWrap>
      <DesktopBar>
        <BookContext>
          <ContextLabel>Current</ContextLabel>
          <ContextTitle>{activeBookTitle}</ContextTitle>
          <ContextMeta>{selectedBook?.chapters?.length || 0} chapters</ContextMeta>
          <ContextMeta>{bookWordCount.toLocaleString()} words</ContextMeta>
        </BookContext>

        <NavRow>
          {NAV_ITEMS.map((item) => (
            <NavPill key={item.to} to={item.to} active={isActive(item.to) ? 1 : 0}>
              {item.label}
            </NavPill>
          ))}
        </NavRow>
      </DesktopBar>

      <MobileDock>
        {NAV_ITEMS.map((item) => (
          <DockLink key={item.to} to={item.to} active={isActive(item.to) ? 1 : 0}>
            <DockIcon>{item.icon}</DockIcon>
            {item.label}
          </DockLink>
        ))}
      </MobileDock>
    </NavWrap>
  );
}

export default TopMenu;
