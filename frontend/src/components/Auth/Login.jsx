import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error, status } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(login({ email, password }));

    if (login.fulfilled.match(result)) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="wrapper">
      <div className="left">
        <div className="login-box">
          <h2>Sistema de gestión de CIMA</h2>
          <h3>Inicia sesión con tu credenciales asignadas</h3>
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              className="input"
              placeholder="Correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              className="input"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" disabled={status === 'loading'}>
              {status === 'loading' ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
            {error && <p className="error-message">{error}</p>}
          </form>
        </div>
      </div>
      <div className="right">
        <h1>¡Bienvenido!</h1>
        <p>
          Este sistema te permitirá gestionar los proyectos de manera eficiente, asignar tareas,
          visualizar estados y colaborar con tu equipo en tiempo real.
        </p>
      </div>
    </div>
  );
};

export default Login;
