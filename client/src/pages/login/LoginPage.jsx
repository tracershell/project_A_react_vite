import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // ✅ AuthContext 사용

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // ✅ 로그인 함수 가져오기

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const user = await login(username, password); // 로그인 요청
      if (user?.role === 'admin') navigate('/admin');
      else navigate('/user');
    } catch (err) {
      setError('로그인에 실패했습니다.');
    }
  };

  return (
    <div style={{ maxWidth: '300px', margin: '60px auto', textAlign: 'center' }}>
      <h2>Log in</h2>
      <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
        If you haven't registered yet, you'll need to register first.
      </p>

      {error && (
        <div style={{ backgroundColor: '#ffdddd', color: '#a94442', padding: '0.5rem', borderRadius: '5px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleLogin}>
        <input
          name="username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Username"
          required
          style={{ width: '100%', padding: '10px', marginBottom: '1rem' }}
        />
        <input
          type="password"
          name="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          required
          style={{ width: '100%', padding: '10px', marginBottom: '1rem' }}
        />
        <button
          type="submit"
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.95rem',
            cursor: 'pointer'
          }}
        >
          Continue
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
