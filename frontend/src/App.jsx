import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Login from './components/Auth/Login';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import CreateClient from './components/Client/CreateClient';
import EditClient from './components/Client/EditClient';
import UserManagement from './components/Client/UserManagement';
import RoleManagement from './components/Roles/RoleManagement'; // Nueva gestión de roles
import ProtectedRoute from './routes/ProtectedRoute';
import Dashboard from './components/Dashboard/Dashboard'; // Importa el Dashboard aquí
import CreateUser from './components/Client/CreateUser';
const App = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div>
      <Routes>
        {/* Ruta para el login */}
        <Route path="/login" element={<Login />} />

        {/* Ruta protegida para el Dashboard del Administrador */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute roles={['Admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />


        {/* Ruta protegida para crear un cliente */}
        <Route
          path="/create-users-register"
          element={
            <ProtectedRoute roles={['Admin']}>
              {/*<CreateClient />*/}
              <CreateUser />
            </ProtectedRoute>
          }
        />

        {/* Ruta protegida para editar un cliente */}
        <Route
          path="/edit-client/:id"
          element={
            <ProtectedRoute roles={['Admin']}>
              <EditClient />
            </ProtectedRoute>
          }
        />

        {/* Ruta protegida para ver la tabla de clientes */}
        <Route
          path="/clients"
          element={
            <ProtectedRoute roles={['Admin', 'Worker']}>
              <UserManagement />
            </ProtectedRoute>
          }
        />

        {/* Ruta protegida para gestionar roles */}
        <Route
          path="/roles"
          element={
            <ProtectedRoute roles={['Admin']}>
              <RoleManagement /> {/* Nueva gestión de roles */}
            </ProtectedRoute>
          }
        />

        {/* Ruta protegida para el Dashboard de Clientes/Trabajadores */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={['Admin', 'Worker', 'Client']}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Redirección condicional a dashboard o login */}
        <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} />} />

        {/* Ruta de acceso denegado */}
        <Route path="/unauthorized" element={<h1>Acceso no autorizado</h1>} />
      </Routes>
    </div>
  );
};

export default App;
