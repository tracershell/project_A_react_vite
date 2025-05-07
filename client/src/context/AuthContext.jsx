import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

// Context 생성
const AuthContext = createContext();

// Provider 정의
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);     // 현재 사용자 정보
  const [loading, setLoading] = useState(true); // 초기 로딩 상태
  const [error, setError] = useState(null);     // 로그인/인증 에러

  // 앱 시작 시 사용자 정보 불러오기
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    axios.get('/api/auth/me')
      .then(res => {
        setUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      })
      .catch(() => {
        setUser(null);
        localStorage.removeItem('user');
      })
      .finally(() => setLoading(false));
  }, []);

  // 로그인 함수
  const login = async (username, password) => {
    try {
      const res = await axios.post('/api/auth/login', { username, password });
      setUser(res.data.user);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setError(null);
      return res.data.user;  // ✅ 로그인 후 user 반환
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      return null;  // 실패 시 null 반환
    }
  };

  // 로그아웃 함수
  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
      setUser(null);
      localStorage.removeItem('user');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Context 접근 훅
export const useAuth = () => useContext(AuthContext);
