import React, { createContext, useContext, useState } from 'react';

interface AuthContextType {
  user: string | null;
  userId: string | null;
  token: string | null;
  email: string | null;
  login: (username: string, token: string, userId?: string | null, email?: string | null) => void;
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
  const [userId, setUserId] = useState<string | null>(() => {
    try {
      return localStorage.getItem('nexus_user_id');
    } catch (e) {
      return null;
    }
  });
  const [email, setEmail] = useState<string | null>(() => {
    try {
      return localStorage.getItem('nexus_email');
    } catch (e) {
      return null;
    }
  });

  const login = (username: string, canvasToken: string, supabaseUserId?: string | null, userEmail?: string | null) => {
    setUser(username);
    setToken(canvasToken);
    setUserId(supabaseUserId ?? null);
    setEmail(userEmail ?? null);
    try {
      localStorage.setItem('nexus_user', username);
      localStorage.setItem('nexus_token', canvasToken);
      if (supabaseUserId) {
        localStorage.setItem('nexus_user_id', supabaseUserId);
      } else {
        localStorage.removeItem('nexus_user_id');
      }
      if (userEmail) {
        localStorage.setItem('nexus_email', userEmail);
      } else {
        localStorage.removeItem('nexus_email');
      }
    } catch (e) {
      // ignore storage errors
    }
  };
  const logout = () => {
    setUser(null);
    setToken(null);
    setUserId(null);
    setEmail(null);
    try {
      localStorage.removeItem('nexus_user');
      localStorage.removeItem('nexus_token');
      localStorage.removeItem('nexus_user_id');
      localStorage.removeItem('nexus_email');
    } catch (e) {
      // ignore
    }
  };

  return (
    <AuthContext.Provider value={{ user, userId, token, email, login, logout }}>
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