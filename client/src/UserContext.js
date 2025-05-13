import React, { createContext, useState, useEffect } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const cookies = document.cookie.split(';').map(c => c.trim());
    const userCookie = cookies.find(c => c.startsWith('user='));

    if (userCookie) {
      try {
        const base64 = decodeURIComponent(userCookie.split('=')[1]);
        const json = atob(base64);
        const parsed = JSON.parse(json);
        setUser(parsed);
      } catch (err) {
        console.error('Failed to parse user cookie', err);
      }
    } else {
      window.location.href = `https://secure.blahpunk.com/oauth_login?next=${encodeURIComponent(window.location.href)}`;
    }
  }, []);

  const logout = () => {
    setUser(null);
    document.cookie = 'user=; Max-Age=0; path=/; domain=.blahpunk.com; secure; samesite=None';
    window.location.href = `https://secure.blahpunk.com/logout`;
  };

  return (
    <UserContext.Provider value={{ user, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export default UserContext;
