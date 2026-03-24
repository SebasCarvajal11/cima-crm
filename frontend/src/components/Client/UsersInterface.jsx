import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableRow, 
  Typography, 
  Avatar, 
  Button, 
  IconButton,
  TextField,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import styled from '@emotion/styled';
import { alpha } from '@mui/material/styles';
import { stringToColor, adjustColor, getInitials, getPlanColor } from '../../utils/colorUtils';
// Reuse styled components from UserManagement
const EnhancedTableContainer = styled(Box)(({ theme }) => ({
  background: '#ffffff',
  borderRadius: '20px',
  boxShadow: '0 0 50px 0 rgba(82, 63, 105, 0.15)',
  overflow: 'hidden',
  border: '1px solid #ebedf3',
}));

const TableToolbar = styled(Box)(({ theme }) => ({
  padding: '20px 24px',
  background: '#ffffff',
  borderBottom: '1px solid #ebedf3',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '16px',
}));

const SearchBar = styled('div')(({ theme }) => ({
  position: 'relative',
  flex: '1',
  maxWidth: '400px',
  '& .MuiInputBase-root': {
    width: '100%',
    background: alpha('#f3f6f9', 0.7),
    borderRadius: '10px',
    '&:hover': {
      background: '#f3f6f9',
    },
  },
  '& .MuiInputBase-input': {
    padding: '12px 12px 12px 45px',
  },
  '& .MuiSvgIcon-root': {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#b5b5c3',
  },
}));

// Update the StyledTableHead component to use your color scheme
const StyledTableHead = styled(TableHead)(({ theme }) => ({
  '& .MuiTableCell-head': {
    background: '#8e3031',
    color: '#ffffff',
    fontWeight: 600,
    fontSize: '0.95rem',
    padding: '16px 24px',
    borderBottom: '1px solid #ebedf3',
    whiteSpace: 'nowrap',
  },
}));

// Add the StyledTableRow component
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:hover': {
    backgroundColor: alpha('#f3f6f9', 0.7),
  },
  '& .MuiTableCell-root': {
    padding: '16px 24px',
    borderBottom: '1px solid #ebedf3',
    color: '#464E5F',
  },
}));

// Update the StatusChip component colors
const StatusChip = styled(Box)(({ status }) => ({
  padding: '6px 12px',
  borderRadius: '6px',
  fontSize: '0.85rem',
  fontWeight: 500,
  display: 'inline-flex',
  alignItems: 'center',
  ...(status === 'Admin' && {
    background: alpha('#8e3031', 0.1),
    color: '#8e3031',
  }),
  ...(status === 'Worker' && {
    background: alpha('#592d2d', 0.1),
    color: '#592d2d',
  }),
  ...(status === 'Client' && {
    background: alpha('#f1416c', 0.1),
    color: '#f1416c',
  }),
}));

// Update the ActionButton component colors
const ActionButton = styled(Button)(({ variant }) => ({
  background: variant === 'create' 
    ? 'linear-gradient(45deg, #8e3031 30%, #592d2d 90%)'
    : 'linear-gradient(45deg, #e74c3c 30%, #c0392b 90%)',
  boxShadow: variant === 'create'
    ? '0 3px 5px 2px rgba(142, 48, 49, .3)'
    : '0 3px 5px 2px rgba(231, 76, 60, .3)',
  borderRadius: '8px',
  padding: '10px 25px',
  color: 'white',
  textTransform: 'none',
  fontWeight: 600,
  '&:hover': {
    background: variant === 'create'
      ? 'linear-gradient(45deg, #592d2d 30%, #3d1e1e 90%)'
      : 'linear-gradient(45deg, #c0392b 30%, #a93226 90%)',
  }
}));

const UsersInterface = ({ token }) => {
  // Estado para los usuarios del staff (Worker y Admin)
  const [staffUsers, setStaffUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para el diálogo (crear/editar/eliminar)
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Worker',
    department: '',
    position: ''
  });
  
  // Estado para el loading del envío del formulario
  const [formLoading, setFormLoading] = useState(false);
  
  // Paginación
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;
  
  // Obtener todos los usuarios del staff cuando se monte el componente
  useEffect(() => {
    const fetchStaffUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get('${import.meta.env.VITE_API_URL}/users/staff', {
          headers: {
            'Content-Type': 'application/json',
            'accesstoken': token
          }
        });
        
        console.log('Datos de staff recibidos:', response.data);
        setStaffUsers(response.data.users || []);
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar usuarios del staff:', err);
        setError('Error al cargar usuarios del staff');
        toast.error('Error al cargar usuarios del staff', { position: 'top-center' });
        setLoading(false);
      }
    };

    if (token) {
      fetchStaffUsers();
    }
  }, [token]);
  
  const handlePageChange = (event, value) => {
    setPage(value);
  };
  
  // Función para abrir el diálogo según la acción
  const openDialog = (mode, user = null) => {
    setDialogMode(mode);
    setSelectedUser(user);
    if (mode === 'edit' && user) {
      setFormData({ 
        ...user,
        department: user.department || '',
        position: user.position || ''
      });
    } else if (mode === 'create') {
      setFormData({ 
        name: '', 
        email: '', 
        password: '', 
        role: 'Worker',
        department: '',
        position: ''
      });
    }
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedUser(null);
    setFormLoading(false);
  };
  
  // Manejo del envío del formulario para crear/editar
  const handleFormSubmit = async (e) => {
    e.preventDefault();
  
    // Validación mínima: nombre, email y rol obligatorios
    if (!formData.name || !formData.email || !formData.role) {
      toast.error('Nombre, Email y Rol son obligatorios', { position: 'top-center' });
      return;
    }
    
    // Validación adicional para contraseña en modo creación
    if (dialogMode === 'create' && !formData.password) {
      toast.error('La contraseña es obligatoria para crear un usuario', { position: 'top-center' });
      return;
    }
  
    if (formLoading) return;
    setFormLoading(true);
  
    try {
      if (dialogMode === 'create') {
        // Crear nuevo usuario del staff
        const userData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role
        };

        console.log('Creando usuario con datos:', userData);

        // Configuración para la petición
        const response = await axios.post(
          '${import.meta.env.VITE_API_URL}/users/register',
          userData,
          {
            headers: {
              'Content-Type': 'application/json',
              'accesstoken': token
            }
          }
        );

        console.log('Usuario creado:', response.data);
        
        // Check the structure of the response and extract the user data
        const newUser = response.data.user || response.data;
        
        // Make sure the user object has an id property that can be used as userId
        const userWithId = {
          ...newUser,
          userId: newUser.userId || newUser.id || Date.now().toString() // Fallback to timestamp if no ID
        };
        
        // Actualizar la lista de usuarios
        setStaffUsers(prevUsers => [...prevUsers, userWithId]);
        toast.success('Usuario creado exitosamente', { position: 'top-center' });
        closeDialog();
      } else if (dialogMode === 'edit') {
        // Código existente para editar...
        // Determine the ID of the user to update
        const userId = selectedUser.userId || selectedUser.id;
        
        if (!userId) {
          console.error('Usuario sin ID para editar:', selectedUser);
          toast.error('El usuario seleccionado no tiene un ID definido', { position: 'top-center' });
          setFormLoading(false);
          return;
        }
        
        try {
          // Prepare data for user update
          const updateData = {
            name: formData.name,
            email: formData.email,
            role: formData.role
          };
          
          // If password is provided, include it in the update
          if (formData.password && formData.password.trim() !== '') {
            updateData.password = formData.password;
          }
          
          console.log('Updating user with data:', updateData);
          
          // Update user using the correct endpoint
          const response = await axios.put(
            `${import.meta.env.VITE_API_URL}/users/${userId}`,
            updateData,
            {
              headers: {
                'Content-Type': 'application/json',
                'accesstoken': token
              }
            }
          );
          
          console.log('User updated successfully:', response.data);
          
          // Update the local state
          const updatedUsers = staffUsers.map(user => {
            if ((user.userId || user.id) === userId) {
              return { ...user, ...updateData };
            }
            return user;
          });
          
          setStaffUsers(updatedUsers);
          toast.success('Usuario actualizado exitosamente', { position: 'top-center' });
          closeDialog();
        } catch (error) {
          console.error('Error updating user:', error);
          toast.error(`Error al actualizar usuario: ${error.response?.data?.message || error.message}`, { position: 'top-center' });
          setFormLoading(false);
        }
      }
    } catch (err) {
      console.error('Error en la operación:', err);
      toast.error(`Error: ${err.response?.data?.message || 'Ocurrió un problema'}`, { position: 'top-center' });
    } finally {
      setFormLoading(false);
    }
  };
  
  const handleDelete = async () => {
    if (!selectedUser) {
      toast.error('No se ha seleccionado ningún usuario para eliminar', { position: 'top-center' });
      return;
    }
    
    const userId = selectedUser.userId || selectedUser.id;
    
    if (!userId) {
      console.error('Usuario sin ID:', selectedUser);
      toast.error('El usuario seleccionado no tiene un ID definido', { position: 'top-center' });
      return;
    }
  
    try {
      console.log('Attempting to delete user with ID:', userId);
      
      // Eliminar usuario
      await axios.delete(`${import.meta.env.VITE_API_URL}/users/${userId}`, {
        headers: {
          'Content-Type': 'application/json',
          'accesstoken': token
        }
      });
  
      // Actualizar estado local
      const updatedUsers = staffUsers.filter(user => (user.userId || user.id) !== userId);
      
      setStaffUsers(updatedUsers);
      toast.success('Usuario eliminado correctamente', { position: 'top-center' });
      closeDialog();
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      toast.error(`Error al eliminar usuario: ${error.response?.data?.message || error.message}`, { position: 'top-center' });
    }
  };
  
  const currentUsers = staffUsers.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', p: 3 }}>
        <Typography color="error">{error}</Typography>
        <Button 
          variant="contained" 
          sx={{ mt: 2 }}
          onClick={() => window.location.reload()}
        >
          Reintentar
        </Button>
      </Box>
    );
  }

  return (
    <EnhancedTableContainer>
      <TableToolbar>
        <SearchBar>
          <SearchIcon />
          <TextField
            placeholder="Buscar usuario..."
            variant="standard"
            InputProps={{
              disableUnderline: true,
            }}
          />
        </SearchBar>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<FilterListIcon />}
          >
            Filtrar
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => openDialog('create')}
            sx={{
              background: 'linear-gradient(135deg,rgb(0, 0, 0) 0%,rgb(0, 0, 0) 100%)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(135deg,rgb(0, 0, 0) 0%,rgb(207, 215, 224) 100%)',
              },
            }}
          >
            Nuevo Usuario
          </Button>
        </Box>
      </TableToolbar>

      <Table>
        <StyledTableHead>
          <TableRow>
            <TableCell>Usuario</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Rol</TableCell>
            <TableCell>Fecha de creación</TableCell>
            <TableCell>Última actualización</TableCell>
            <TableCell align="right">Acciones</TableCell>
          </TableRow>
        </StyledTableHead>
        <TableBody>
          {currentUsers.map((user, index) => {
            const userKey = user.userId || user.id || `staff-${index}`;
            
            return (
              <StyledTableRow key={userKey}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ 
                      background: user.name 
                        ? `linear-gradient(135deg, ${stringToColor(user.name)} 0%, ${adjustColor(stringToColor(user.name), -20)} 100%)`
                        : 'linear-gradient(135deg, #000000 0%, #333333 100%)',
                      }}>
                        {getInitials(user.name)}
                      </Avatar>
                      <Typography sx={{ color: '#3f4254', fontWeight: 500 }}>
                        {user.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <StatusChip status={user.role}>
                      {user.role}
                    </StatusChip>
                  </TableCell>
                  <TableCell>
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    }) : '-'}
                  </TableCell>
                  <TableCell>
                    {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    }) : '-'}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={() => openDialog('edit', user)}
                      sx={{ color: '#592d2d' }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => openDialog('delete', user)}
                      sx={{ color: '#f1416c' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </StyledTableRow>
              );
            })}
          </TableBody>
        </Table>
  
        <Box sx={{ 
          padding: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid #ebedf3',
        }}>
          <Typography sx={{ color: '#7e8299' }}>
            Mostrando {currentUsers.length} de {staffUsers.length} usuarios
          </Typography>
          <Pagination
            count={Math.ceil(staffUsers.length / rowsPerPage)}
            page={page}
            onChange={handlePageChange}
            variant="outlined"
            shape="rounded"
            sx={{
              '& .MuiPaginationItem-root': {
                borderColor: '#e9ecef',
                color: '#7e8299',
                '&.Mui-selected': {
                  background: '#f3f6f9',
                  borderColor: '#3699ff',
                  color: '#3699ff',
                },
              },
            }}
          />
        </Box>
  
        {/* Create/Edit Dialog */}
        <Dialog
          open={dialogOpen && (dialogMode === 'create' || dialogMode === 'edit')}
          onClose={closeDialog}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              '& .MuiDialogTitle-root': {
                background: '#8e3031',
                color: 'white',
                padding: '20px 24px'
              }
            }
          }}
        >
          <DialogTitle>
            {dialogMode === 'create' ? 'Crear Nuevo Usuario' : 'Editar Usuario'}
            <IconButton
              aria-label="close"
              onClick={closeDialog}
              sx={{
                position: 'absolute',
                right: 16,
                top: 16,
                color: 'white',
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ padding: '24px' }}>
            <Box component="form" onSubmit={handleFormSubmit} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Nombre"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                margin="normal"
                required
              />
              {dialogMode === 'create' ? (
                <TextField
                  fullWidth
                  label="Contraseña"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  margin="normal"
                  required
                />
              ) : (
                <TextField
                  fullWidth
                  label="Nueva Contraseña (opcional)"
                  type="password"
                  value={formData.password || ''}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  margin="normal"
                  helperText="Deja en blanco para mantener la contraseña actual"
                />
              )}
              <FormControl fullWidth margin="normal">
                <InputLabel>Rol</InputLabel>
                <Select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  label="Rol"
                >
                  <MenuItem value="Admin">Administrador</MenuItem>
                  <MenuItem value="Worker">Trabajador</MenuItem>
                </Select>
              </FormControl>
              
              {/* Display creation and update dates if editing */}
              {dialogMode === 'edit' && formData.createdAt && (
                <TextField
                  fullWidth
                  label="Fecha de creación"
                  value={new Date(formData.createdAt).toLocaleDateString('es-ES')}
                  margin="normal"
                  disabled
                />
              )}
              
              {dialogMode === 'edit' && formData.updatedAt && (
                <TextField
                  fullWidth
                  label="Última actualización"
                  value={new Date(formData.updatedAt).toLocaleDateString('es-ES')}
                  margin="normal"
                  disabled
                />
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ padding: '16px 24px' }}>
            <Button onClick={closeDialog} sx={{ color: '#7e8299' }}>
              Cancelar
            </Button>
            <ActionButton 
              variant="create" 
              onClick={handleFormSubmit}
              disabled={formLoading}
            >
              {formLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                dialogMode === 'create' ? 'Crear Usuario' : 'Guardar Cambios'
              )}
            </ActionButton>
          </DialogActions>
        </Dialog>
  
        {/* Delete dialog */}
        <Dialog 
          open={dialogOpen && dialogMode === 'delete'} 
          onClose={closeDialog}
          PaperProps={{
            sx: {
              borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }
          }}
        >
          <DialogTitle sx={{ background: '#f1416c', color: 'white' }}>
            Confirmar Eliminación
            <IconButton
              aria-label="close"
              onClick={closeDialog}
              sx={{
                position: 'absolute',
                right: 16,
                top: 16,
                color: 'white',
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ padding: '24px', paddingTop: '24px' }}>
            <Typography variant="body1">
              ¿Estás seguro de que deseas eliminar al usuario <strong>{selectedUser?.name}</strong>?
              Esta acción no se puede deshacer.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ padding: '16px 24px' }}>
            <Button onClick={closeDialog} sx={{ color: '#7e8299' }}>
              Cancelar
            </Button>
            <ActionButton 
              variant="delete" 
              onClick={handleDelete}
            >
              Eliminar Usuario
            </ActionButton>
          </DialogActions>
        </Dialog>
      </EnhancedTableContainer>
    );
  };
  
  export default UsersInterface;