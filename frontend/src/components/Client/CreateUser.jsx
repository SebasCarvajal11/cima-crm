import React, { useState } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Pagination,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Datos iniciales de ejemplo
const initialUsers = [
  { id: 1, name: 'Juan Pérez', email: 'juan@example.com', password: '123456', role: 'Admin', address: 'Calle 123', phone: '555-1234' },
  { id: 2, name: 'Ana García', email: 'ana@example.com', password: 'abcdef', role: 'Worker', address: 'Avenida 456', phone: '555-5678' },
  { id: 3, name: 'Carlos López', email: 'carlos@example.com', password: 'qwerty', role: 'Client', address: 'Calle 789', phone: '555-9012' },
];

const roles = ['Admin', 'Worker', 'Client'];

const AdminDashboard = () => {
  // Estado de usuarios
  const [users, setUsers] = useState(initialUsers);

  // Estados para el diálogo (dialog)
  // dialogMode: 'create' | 'edit' | 'delete'
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [selectedUser, setSelectedUser] = useState(null);

  // Estado del formulario (para crear/editar)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    address: '',
    phone: '',
  });

  // Paginación
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;
  const paginatedUsers = users.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Abrir diálogo según la acción
  const openDialog = (mode, user = null) => {
    setDialogMode(mode);
    setSelectedUser(user);
    if (mode === 'edit' && user) {
      setFormData({ ...user });
    } else if (mode === 'create') {
      setFormData({ name: '', email: '', password: '', role: '', address: '', phone: '' });
    }
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedUser(null);
  };

  // Manejo del envío del formulario para crear/editar
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      toast.error('Nombre y Email son obligatorios', { position: 'top-center' });
      return;
    }

    if (dialogMode === 'create') {
      // Se arma la data y se realiza la petición vía axios
      try {
        const data = JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          address: formData.address,
          phone: formData.phone,
        });
        
        const config = {
          method: 'post',
          maxBodyLength: Infinity,
          url: '${import.meta.env.VITE_API_URL}/users/register',
          headers: { 
            'Content-Type': 'application/json', 
            'Authorization': '••••••' // Ajusta el token o credenciales según corresponda
          },
          data: data,
        };
        
        const response = await axios.request(config);
        // Asumimos que la API retorna un id para el usuario creado
        const newUser = { ...formData, id: response.data.id || Date.now() };
        setUsers([...users, newUser]);
        toast.success('Usuario creado exitosamente', { position: 'top-center' });
        closeDialog();
      } catch (error) {
        console.error(error);
        toast.error('Error al crear usuario', { position: 'top-center' });
      }
    } else if (dialogMode === 'edit') {
      // Para editar, aquí podrías realizar otra petición PUT/PATCH a tu API.
      // En este ejemplo se actualiza directamente en el estado.
      const updatedUsers = users.map((u) =>
        u.id === selectedUser.id ? { ...formData, id: u.id } : u
      );
      setUsers(updatedUsers);
      toast.success('Usuario actualizado', { position: 'top-center' });
      closeDialog();
    }
  };

  // Manejo de eliminación (en este ejemplo se actualiza el estado; también podrías llamar a la API)
  const handleDelete = () => {
    const updatedUsers = users.filter((u) => u.id !== selectedUser.id);
    setUsers(updatedUsers);
    toast.success('Usuario eliminado', { position: 'top-center' });
    closeDialog();
  };

  // Manejo inmediato del cambio de rol en la tabla
  const handleRoleChange = (userId, newRole) => {
    const updatedUsers = users.map((u) =>
      u.id === userId ? { ...u, role: newRole } : u
    );
    setUsers(updatedUsers);
    toast.success('Rol actualizado', { position: 'top-center' });
  };

  return (
    <Box sx={{ p: 4 }}>
      <ToastContainer />
      <Typography variant="h4" align="center" gutterBottom sx={{ color: '#592d2d' }}>
        Gestión de Usuariosssssssssss
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2}}>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => openDialog('create')}
          sx={{
            bgcolor: '#000000',
            '&:hover': {
              bgcolor: '#333333',
            }
          }}
        >
          Crear Usuarios
        </Button>
      </Box>
      <TableContainer component={Paper} sx={{ boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#592d2d' }}>
            <TableRow>
              <TableCell sx={{ color: 'white' }}>Nombre</TableCell>
              <TableCell sx={{ color: 'white' }}>Email</TableCell>
              <TableCell sx={{ color: 'white' }}>Rol</TableCell>
              <TableCell sx={{ color: 'white' }}>Dirección</TableCell>
              <TableCell sx={{ color: 'white' }}>Teléfono</TableCell>
              <TableCell align="center" sx={{ color: 'white' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          
          <TableBody>
            {paginatedUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <FormControl variant="standard" sx={{ minWidth: 120 }}>
                    <InputLabel id={`role-label-${user.id}`}>Rol</InputLabel>
                    <Select
                      labelId={`role-label-${user.id}`}
                      label="Rol"
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    >
                      {roles.map((role) => (
                        <MenuItem key={role} value={role}>
                          {role}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>{user.address}</TableCell>
                <TableCell>{user.phone}</TableCell>
                <TableCell align="center">
                  <IconButton color="primary" onClick={() => openDialog('edit', user)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => openDialog('delete', user)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {paginatedUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No hay usuarios disponibles.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination
          count={Math.ceil(users.length / rowsPerPage)}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>

      {/* Diálogo para crear/editar */}
      <Dialog
        open={dialogOpen && (dialogMode === 'create' || dialogMode === 'edit')}
        onClose={closeDialog}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: '#000000', 
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 1.5
        }}>
          {dialogMode === 'create' ? 'Crear Usuario' : 'Editar Usuario'}
          <IconButton 
            onClick={closeDialog}
            size="small"
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Box component="form" onSubmit={handleFormSubmit}>
          <DialogContent dividers>
            <TextField
              autoFocus
              margin="dense"
              label="Nombre"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <TextField
              margin="dense"
              label="Email"
              type="email"
              fullWidth
              variant="outlined"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <TextField
              margin="dense"
              label="Contraseña"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <FormControl fullWidth margin="dense" variant="outlined" required>
              <InputLabel id="role-dialog-label">Rol</InputLabel>
              <Select
                labelId="role-dialog-label"
                label="Rol"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                {roles.map((role) => (
                  <MenuItem key={role} value={role}>
                    {role}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              margin="dense"
              label="Dirección"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Teléfono"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2, bgcolor: 'grey.50' }}>
            <Button 
              onClick={closeDialog}
              sx={{
                color: 'white',
                bgcolor: '#000000',
                '&:hover': {
                  bgcolor: '#333333',
                }
              }}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              sx={{
                ml: 2,
                color: 'white',
                bgcolor: '#592d2d',
                '&:hover': {
                  bgcolor: '#8e3031',
                },
                '&.Mui-disabled': {
                  bgcolor: 'rgba(89, 45, 45, 0.5)',
                }
              }}
            >
              {dialogMode === 'create' ? 'Crear' : 'Guardar'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Diálogo para confirmar eliminación */}
      <Dialog 
        open={dialogOpen && dialogMode === 'delete'} 
        onClose={closeDialog}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        <DialogTitle sx={{ bgcolor: '#000000', color: 'white' }}>
          Eliminar Usuario
        </DialogTitle>
        <DialogContent dividers>
          <Typography>
            ¿Estás seguro de eliminar a <strong>{selectedUser?.name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, bgcolor: 'grey.50' }}>
          <Button 
            onClick={closeDialog}
            sx={{
              color: 'white',
              bgcolor: '#000000',
              '&:hover': {
                bgcolor: '#333333',
              }
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleDelete} 
            variant="contained" 
            sx={{
              ml: 2,
              color: 'white',
              bgcolor: '#592d2d',
              '&:hover': {
                bgcolor: '#8e3031',
              }
            }}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
