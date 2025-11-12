import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Card from '../../../components/Card/Card';
import Input from '../../../components/Input/Input';
import Button from '../../../components/Button/Button';
import './AdminLogin.css';

function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const redirectTo = location.state?.from || '/admin/dashboard';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.username === 'admin' && form.password === 'admin') {
      localStorage.setItem('isAdmin', 'true');
      setError('');
      navigate(redirectTo, { replace: true });
      return;
    }
    setError('Credenciais inválidas. Use admin / admin.');
  };

  return (
    <div className="admin-login">
      <h1>Login do Administrador</h1>
      <p className="page-subtitle">Acesso restrito à equipe do FerryBot</p>

      <div className="login-grid">
        <Card title="Entrar">
          <form onSubmit={handleSubmit} className="login-form">
            <Input
              label="Usuário"
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="admin"
              required
            />
            <Input
              label="Senha"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="admin"
              required
            />

            {error && <div className="error-box">{error}</div>}

            <Button type="submit" variant="primary" className="login-button">Entrar</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default AdminLogin;


