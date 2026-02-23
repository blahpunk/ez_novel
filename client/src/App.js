import React, { useEffect, useMemo, useContext } from 'react';
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

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 800px;
  background-color: #121212;
  color: #e0e0e0;
`;

const HeaderBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background-color: #1f1f1f;
  border-bottom: 1px solid #333;
`;

const UserInfo = styled.div`
  font-size: 0.9rem;
  color: #a0a0a0;
`;

const LogoutButton = styled.button`
  background: #ff4d4f;
  border: none;
  color: white;
  padding: 6px 10px;
  border-radius: 4px;
  margin-left: 10px;
  cursor: pointer;

  &:hover {
    background: #e04445;
  }
`;

const AuthGate = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px;
  background: linear-gradient(180deg, #121212 0%, #1a1a1a 100%);
  color: #f0f0f0;
  text-align: center;
`;

const LoginButton = styled.a`
  display: inline-block;
  background: #3b82f6;
  color: #fff;
  text-decoration: none;
  font-weight: 600;
  padding: 10px 14px;
  border-radius: 6px;

  &:hover {
    background: #2563eb;
  }
`;

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

  useEffect(() => {
    if (!user) return;

    axios
      .get('/api/novel', { timeout: 10000, withCredentials: true })
      .then((response) => {
        dispatch(setBooks(response.data));
      })
      .catch((err) => console.error('Error fetching data', err));
  }, [dispatch, user]);

  const debouncedSave = useMemo(
    () =>
      debounce((data) => {
        if (!user) return;

        axios
          .post('/api/novel', data, { timeout: 10000, withCredentials: true })
          .then(() => console.log('Auto-saved'))
          .catch((err) => console.error('Save error', err));
      }, 1000),
    [user]
  );

  useEffect(() => {
    if (!user) return;
    debouncedSave(novelData);
  }, [novelData, debouncedSave, user]);

  useEffect(() => {
    return () => {
      debouncedSave.flush();
    };
  }, [debouncedSave]);

  if (authLoading) {
    return <AuthGate>Checking sign-in...</AuthGate>;
  }

  if (!user && authRequired) {
    const loginUrl = `https://secure.blahpunk.com/oauth_login?next=${encodeURIComponent(window.location.href)}`;

    return (
      <AuthGate>
        <h1>EZ Novel</h1>
        <p>Sign in to continue.</p>
        <LoginButton href={loginUrl}>Continue with Google</LoginButton>
      </AuthGate>
    );
  }

  if (!user) {
    return <AuthGate>Unable to verify sign-in right now.</AuthGate>;
  }

  return (
    <Router>
      <AppContainer>
        <HeaderBar>
          <div>EZ Novel Author</div>
          {user && (
            <UserInfo>
              {user.name} ({user.email})
              <LogoutButton onClick={logout}>Logout</LogoutButton>
            </UserInfo>
          )}
        </HeaderBar>
        <TopMenu />
        <Routes>
          <Route path="/books" element={<BooksPage />} />
          <Route path="/chapters" element={<ChaptersPage />} />
          <Route path="/characters" element={<CharactersPage />} />
          <Route path="/plots" element={<PlotPage />} />
          <Route path="/locations" element={<LocationsPage />} />
          <Route path="*" element={<BooksPage />} />
        </Routes>
      </AppContainer>
    </Router>
  );
}

export default App;
