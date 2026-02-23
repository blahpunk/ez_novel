import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authRequired, setAuthRequired] = useState(false);

  useEffect(() => {
    axios
      .get('/api/me', { timeout: 10000, withCredentials: true })
      .then((response) => {
        setUser(response.data?.user || null);
        setAuthRequired(false);
      })
      .catch((err) => {
        const status = err?.response?.status;
        if (status === 401) {
          setAuthRequired(true);
          return;
        }

        console.error('Auth check failed', err);
      })
      .finally(() => {
        setAuthLoading(false);
      });
  }, []);

  const logout = () => {
    setUser(null);
    document.cookie = 'user=; Max-Age=0; path=/; domain=.blahpunk.com; secure; samesite=None';
    window.location.href = 'https://secure.blahpunk.com/logout';
  };

  return (
    <UserContext.Provider value={{ user, authLoading, authRequired, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export default UserContext;
