import React, { createContext, useContext, useState } from 'react';

interface AuthContextType {
  user: string | null;
  token: string | null;
  login: (username: string, token: string) => void;
  logout: () => void;
}

// Pass type to createContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize from localStorage so auth persists across reloads in the dev demo
  const [user, setUser] = useState<string | null>(() => {
    try {
      return localStorage.getItem('nexus_user');
    } catch (e) {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('nexus_token');
    } catch (e) {
      return null;
    }
  });

  const login = (username: string, canvasToken: string) => {
    setUser(username);
    setToken(canvasToken);
    try {
      localStorage.setItem('nexus_user', username);
      localStorage.setItem('nexus_token', canvasToken);
    } catch (e) {
      // ignore storage errors
    }
  };
  const logout = () => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem('nexus_user');
      localStorage.removeItem('nexus_token');
    } catch (e) {
      // ignore
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use the context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};