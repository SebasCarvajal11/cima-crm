import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ roles, children }) => {
  const { user } = useSelector((state) => state.auth);

  // Verificación de autenticación
  if (!user) {
    ////console.log.log('Usuario no autenticado, redirigiendo a /login');
    return <Navigate to="/login" />;
  }

  // Verificación de rol
  if (roles && !roles.includes(user.role)) {
    ///console.log.log('Usuario sin rol adecuado, redirigiendo a /unauthorized');
    return <Navigate to="/unauthorized" />;
  }

  ///console.log.log('Usuario autenticado con rol adecuado:', user.role);

  // Renderiza el componente hijo directamente
  return children;
};

export default ProtectedRoute;
