import React, { useEffect, useMemo, useContext, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TopMenu from './components/TopMenu';
import BooksPage from './pages/BooksPage';
import ChaptersPage from './pages/ChaptersPage';
import CharactersPage from './pages/CharactersPage';
import PlotPage from './pages/PlotPage';
import LocationsPage from './pages/LocationsPage';
import styled from 'styled-components';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import axios from 'axios';
import debounce from 'lodash.debounce';
import { setBooks } from './redux/actions';
import UserContext from './UserContext';
import { rawToText } from './utils/rawToText';

const AppShell = styled.div`
  min-height: 100dvh;
  color: var(--text-primary);
  background:
    radial-gradient(1000px 420px at -10% -20%, rgba(45, 212, 191, 0.16) 0%, rgba(45, 212, 191, 0) 62%),
    radial-gradient(700px 340px at 110% -15%, rgba(245, 158, 11, 0.14) 0%, rgba(245, 158, 11, 0) 66%),
    linear-gradient(180deg, var(--bg-deep) 0%, var(--bg-base) 100%);
`;

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 40;
  backdrop-filter: blur(10px);
  background: rgba(9, 15, 27, 0.84);
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
`;

const HeaderInner = styled.div`
  max-width: 1320px;
  margin: 0 auto;
  padding: 16px 20px;
  display: grid;
  grid-template-columns: 1.1fr 1fr auto;
  gap: 14px;
  align-items: center;

  @media (max-width: 1080px) {
    grid-template-columns: 1fr;
    gap: 10px;
    padding: 14px 16px;
  }
`;

const BrandBlock = styled.div`
  animation: fadeInUp 360ms ease both;
`;

const BrandTitle = styled.h1`
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(1.25rem, 2.5vw, 1.8rem);
  letter-spacing: 0.3px;
  color: #f8fbff;
`;

const BrandSubtitle = styled.p`
  margin: 3px 0 0;
  color: var(--text-muted);
  font-size: 0.9rem;
`;

const StatRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
`;

const StatChip = styled.div`
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.03);
  color: var(--text-secondary);
  font-size: 0.82rem;

  strong {
    color: #ffffff;
    font-weight: 700;
  }
`;

const UtilityBlock = styled.div`
  justify-self: end;
  display: flex;
  align-items: center;
  gap: 10px;

  @media (max-width: 1080px) {
    justify-self: start;
    flex-wrap: wrap;
  }
`;

const SaveIndicator = styled.div`
  border: 1px solid
    ${({ tone }) => (tone === 'ok' ? 'rgba(45, 212, 191, 0.52)' : tone === 'warn' ? 'rgba(245, 158, 11, 0.52)' : 'rgba(239, 68, 68, 0.5)')};
  background: ${({ tone }) => (tone === 'ok' ? 'rgba(45, 212, 191, 0.14)' : tone === 'warn' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(239, 68, 68, 0.12)')};
  color: #eaf5ff;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 0.8rem;
  white-space: nowrap;
`;

const UserPill = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 999px;
  padding: 4px 4px 4px 10px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.03);
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
  line-height: 1.15;
`;

const UserName = styled.span`
  font-size: 0.8rem;
  color: #fff;
`;

const UserEmail = styled.span`
  font-size: 0.74rem;
  color: var(--text-muted);
  max-width: 210px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

const LogoutButton = styled.button`
  border: 0;
  border-radius: 999px;
  padding: 8px 11px;
  font-size: 0.76rem;
  font-weight: 700;
  cursor: pointer;
  color: #2a1406;
  background: linear-gradient(135deg, #f59e0b, #f97316);
  transition: transform 180ms ease, filter 180ms ease;

  &:hover {
    transform: translateY(-1px);
    filter: brightness(1.05);
  }
`;

const MainContent = styled.main`
  max-width: 1320px;
  margin: 0 auto;
  width: 100%;
  padding: 16px 20px 24px;

  @media (max-width: 1080px) {
    padding: 12px 14px 98px;
  }
`;

const AuthGate = styled.div`
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const AuthPanel = styled.section`
  max-width: 560px;
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 18px;
  background: rgba(7, 12, 22, 0.84);
  backdrop-filter: blur(8px);
  padding: 26px;
  animation: fadeInUp 380ms ease both;

  h1 {
    margin: 0 0 8px;
    font-family: var(--font-display);
    color: #fff;
    font-size: clamp(1.45rem, 3.4vw, 2rem);
  }

  p {
    margin: 0 0 14px;
    color: var(--text-secondary);
    line-height: 1.45;
  }
`;

const AuthList = styled.ul`
  margin: 0 0 20px;
  padding-left: 20px;
  color: var(--text-muted);
  font-size: 0.92rem;
  line-height: 1.5;
`;

const LoginButton = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-decoration: none;
  border-radius: 12px;
  padding: 12px 16px;
  font-weight: 700;
  color: #082127;
  background: linear-gradient(135deg, #5eead4, #2dd4bf);
  transition: transform 180ms ease, filter 180ms ease;

  &:hover {
    transform: translateY(-1px);
    filter: brightness(1.04);
  }
`;

const countWords = (text) => {
  if (!text) return 0;
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
};

const estimateReadMinutes = (words) => {
  if (!words) return 0;
  return Math.max(1, Math.round(words / 220));
};

function App() {
  const dispatch = useDispatch();
  const { books, selectedBookId } = useSelector(
    (state) => ({
      books: state.books,
      selectedBookId: state.selectedBookId,
    }),
    shallowEqual
  );
  const novelData = useMemo(() => ({ books, selectedBookId }), [books, selectedBookId]);

  const { user, authLoading, authRequired, logout } = useContext(UserContext);

  const [saveState, setSaveState] = useState('idle');
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [hasLoadedData, setHasLoadedData] = useState(false);

  const selectedBook = useMemo(
    () => books.find((book) => book.id === selectedBookId),
    [books, selectedBookId]
  );

  const selectedChapter = useMemo(() => {
    if (!selectedBook || !selectedBook.chapters) return null;
    return (
      selectedBook.chapters.find((chapter) => chapter.id === selectedBook.selectedChapterId) ||
      selectedBook.chapters[0] ||
      null
    );
  }, [selectedBook]);

  const bookWordCount = useMemo(() => {
    if (!selectedBook?.chapters?.length) return 0;
    return selectedBook.chapters.reduce((total, chapter) => {
      return total + countWords(rawToText(chapter.content));
    }, 0);
  }, [selectedBook]);

  const chapterWordCount = useMemo(() => {
    if (!selectedChapter) return 0;
    return countWords(rawToText(selectedChapter.content));
  }, [selectedChapter]);

  useEffect(() => {
    if (!user) return;

    axios
      .get('/api/novel', { timeout: 10000, withCredentials: true })
      .then((response) => {
        dispatch(setBooks(response.data));
        setHasLoadedData(true);
        setLoadError('');
      })
      .catch((err) => {
        setLoadError('Failed to load your writing data. Please refresh.');
        console.error('Error fetching data', err);
      });
  }, [dispatch, user]);

  const debouncedSave = useMemo(
    () =>
      debounce((data) => {
        if (!user) return;

        axios
          .post('/api/novel', data, { timeout: 10000, withCredentials: true })
          .then(() => {
            setSaveState('saved');
            setLastSavedAt(new Date());
          })
          .catch((err) => {
            setSaveState('error');
            console.error('Save error', err);
          });
      }, 1100),
    [user]
  );

  useEffect(() => {
    if (!user || !hasLoadedData) return;
    setSaveState('saving');
    debouncedSave(novelData);
  }, [novelData, debouncedSave, user, hasLoadedData]);

  useEffect(() => {
    return () => {
      debouncedSave.flush();
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  const saveTone = saveState === 'error' ? 'error' : saveState === 'saving' ? 'warn' : 'ok';
  const saveLabel =
    saveState === 'error'
      ? 'Save failed'
      : saveState === 'saving'
      ? 'Saving changes'
      : lastSavedAt
      ? `Saved at ${lastSavedAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
      : 'All changes synced';

  if (authLoading) {
    return (
      <AuthGate>
        <AuthPanel>
          <h1>Preparing your workspace</h1>
          <p>Loading editor session and connected writing projects.</p>
        </AuthPanel>
      </AuthGate>
    );
  }

  if (!user && authRequired) {
    const loginUrl = `https://secure.blahpunk.com/oauth_login?next=${encodeURIComponent(window.location.href)}`;

    return (
      <AuthGate>
        <AuthPanel>
          <h1>Write with structure, not friction</h1>
          <p>
            Your workspace is set up for drafting, planning, character management, and export. Sign in to continue where
            you left off.
          </p>
          <AuthList>
            <li>Chapter drafting optimized for desktop and mobile editing.</li>
            <li>Built-in organization for characters, locations, and plot threads.</li>
            <li>Automatic save + one-click manuscript export.</li>
          </AuthList>
          <LoginButton href={loginUrl}>Continue with Google</LoginButton>
        </AuthPanel>
      </AuthGate>
    );
  }

  if (!user) {
    return (
      <AuthGate>
        <AuthPanel>
          <h1>Sign-in check failed</h1>
          <p>Unable to verify your session right now.</p>
        </AuthPanel>
      </AuthGate>
    );
  }

  return (
    <Router>
      <AppShell>
        <Header>
          <HeaderInner>
            <BrandBlock>
              <BrandTitle>EZ Novel Studio</BrandTitle>
              <BrandSubtitle>
                {selectedBook ? `Active manuscript: ${selectedBook.title}` : 'Select or create a manuscript to begin'}
              </BrandSubtitle>
            </BrandBlock>

            <StatRow>
              <StatChip>
                Chapters <strong>{selectedBook?.chapters?.length || 0}</strong>
              </StatChip>
              <StatChip>
                Book words <strong>{bookWordCount.toLocaleString()}</strong>
              </StatChip>
              <StatChip>
                Chapter words <strong>{chapterWordCount.toLocaleString()}</strong>
              </StatChip>
              <StatChip>
                Read time <strong>{estimateReadMinutes(chapterWordCount)} min</strong>
              </StatChip>
            </StatRow>

            <UtilityBlock>
              <SaveIndicator tone={saveTone}>{saveLabel}</SaveIndicator>
              <UserPill>
                <UserDetails>
                  <UserName>{user.name || 'Writer'}</UserName>
                  <UserEmail>{user.email}</UserEmail>
                </UserDetails>
                <LogoutButton onClick={logout}>Logout</LogoutButton>
              </UserPill>
            </UtilityBlock>
          </HeaderInner>
          <TopMenu />
        </Header>

        <MainContent>
          {loadError && <p style={{ color: '#fca5a5', margin: '0 0 14px' }}>{loadError}</p>}
          <Routes>
            <Route path="/books" element={<BooksPage />} />
            <Route path="/chapters" element={<ChaptersPage />} />
            <Route path="/characters" element={<CharactersPage />} />
            <Route path="/plots" element={<PlotPage />} />
            <Route path="/locations" element={<LocationsPage />} />
            <Route path="*" element={<BooksPage />} />
          </Routes>
        </MainContent>
      </AppShell>
    </Router>
  );
}

export default App;
