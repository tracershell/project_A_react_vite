import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginPage = () => {
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const { username, password } = e.target.elements;

    try {
      const res = await axios.post('/api/auth/login', {
        username: username.value,
        password: password.value,
      });

      const { role } = res.data.user;
      if (role === 'admin') navigate('/admin');
      else navigate('/user');
    } catch (err) {
      alert('Login failed');
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input name="username" placeholder="Username" />
      <input name="password" type="password" placeholder="Password" />
      <button type="submit">Login</button>
    </form>
  );
};

export default LoginPage;
