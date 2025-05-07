import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios.get('/api/auth/me')
      .then(res => setUser(res.data.user))
      .catch(() => setUser(null));
  }, []);

  const login = async (username, password) => {
    const res = await axios.post('/api/auth/login', { username, password });
    setUser(res.data.user);
  };

  const logout = async () => {
    await axios.post('/api/auth/logout');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
