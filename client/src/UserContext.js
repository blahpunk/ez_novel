import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const UserContext = createContext();
const AUTH_COOKIE_KEYS = ['user', 'user_sig'];
const AUTH_COOKIE_PERSIST_SECONDS = 60 * 60 * 24 * 30;

const getCookieValue = (name) => {
  const prefix = `${name}=`;
  const parts = document.cookie.split(';');
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.startsWith(prefix)) {
      return trimmed.slice(prefix.length);
    }
  }
  return '';
};

const persistAuthCookies = () => {
  AUTH_COOKIE_KEYS.forEach((key) => {
    const value = getCookieValue(key);
    if (!value) return;
    document.cookie = `${key}=${value}; Max-Age=${AUTH_COOKIE_PERSIST_SECONDS}; path=/; domain=.blahpunk.com; secure; samesite=None`;
  });
};

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
        persistAuthCookies();
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

  useEffect(() => {
    if (!user) return undefined;

    const heartbeatId = window.setInterval(() => {
      persistAuthCookies();
    }, 60000);

    return () => window.clearInterval(heartbeatId);
  }, [user]);

  const logout = () => {
    setUser(null);
    AUTH_COOKIE_KEYS.forEach((key) => {
      document.cookie = `${key}=; Max-Age=0; path=/; domain=.blahpunk.com; secure; samesite=None`;
    });
    const nextUrl = `${window.location.origin}/`;
    window.location.href = `https://secure.blahpunk.com/logout?next=${encodeURIComponent(nextUrl)}`;
  };

  return (
    <UserContext.Provider value={{ user, authLoading, authRequired, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export default UserContext;
