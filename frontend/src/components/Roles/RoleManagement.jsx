import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';  // Importar estilos de react-toastify
import './RoleManagement.css';  // Importar los estilos

const RoleManagement = () => {
  // Datos ficticios para pruebas
  const [users, setUsers] = useState([
    { id: 1, name: 'Juan Pérez', email: 'juan@example.com', role: 'Admin' },
    { id: 2, name: 'Ana García', email: 'ana@example.com', role: 'Worker' },
    { id: 3, name: 'Carlos López', email: 'carlos@example.com', role: 'Client' },
    // ... (Añade más datos para pruebas si es necesario)
  ]);

  const [currentPage, setCurrentPage] = useState(1);  // Estado de la página actual
  const usersPerPage = 2;  // Cantidad de usuarios por página

  const handleRoleChange = (userId, newRole) => {
    // Confirmación antes de cambiar el rol
    const confirmChange = window.confirm(`¿Estás seguro de cambiar el rol a ${newRole}?`);
    if (confirmChange) {
      // Actualizar el rol del usuario en el array de datos ficticios
      const updatedUsers = users.map((user) =>
        user.id === userId ? { ...user, role: newRole } : user
      );
      setUsers(updatedUsers);  // Actualizar el estado con los nuevos datos

      // Mostrar notificación de éxito
      toast.success(`Rol actualizado a ${newRole} para ${updatedUsers.find(user => user.id === userId).name}`);
    }
  };

  // Lógica para paginación
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  // Cambiar de página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="role-management-container">
      <h1>Gestión de Roles</h1>
      <table className="role-management-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {currentUsers.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  className="role-select"
                >
                  <option value="Admin">Admin</option>
                  <option value="Worker">Worker</option>
                  <option value="Client">Client</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Paginación */}
      <Pagination
        usersPerPage={usersPerPage}
        totalUsers={users.length}
        paginate={paginate}
        currentPage={currentPage}
      />

      {/* Componente para mostrar las notificaciones */}
      <ToastContainer />
    </div>
  );
};

// Componente de paginación
const Pagination = ({ usersPerPage, totalUsers, paginate, currentPage }) => {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalUsers / usersPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <nav className="pagination-nav">
      <ul className="pagination">
        {pageNumbers.map(number => (
          <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
            <a onClick={() => paginate(number)} href="#!" className="page-link">
              {number}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default RoleManagement;
