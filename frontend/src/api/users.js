import axios from 'axios';

// Función para iniciar sesión
export const loginUser = async (credentials) => {
  const response = await axios.post('/api/users/login', credentials);
  return response.data;
};

// Función para registrar un nuevo usuario
export const registerUser = async (userData) => {
  const response = await axios.post('/api/users/register', userData);
  return response.data;
};

// Obtener todos los usuarios
export const getAllUsers = async () => {
  const response = await axios.get('/api/users');
  return response.data;
};

// Obtener un usuario por ID
export const getUserById = async (userId) => {
  const response = await axios.get(`/api/users/${userId}`);
  return response.data;
};

// Actualizar un usuario
export const updateUser = async (userId, updatedData) => {
  const response = await axios.put(`/api/users/${userId}`, updatedData);
  return response.data;
};

// Eliminar un usuario
export const deleteUser = async (userId) => {
  const response = await axios.delete(`/api/users/${userId}`);
  return response.data;
};
