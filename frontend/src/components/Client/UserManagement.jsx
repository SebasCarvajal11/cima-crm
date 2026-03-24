import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import {
  Box,
  Button,
  CircularProgress,
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
  Avatar,
  Tabs,
  Tab,
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Close as CloseIcon,
  People as PeopleIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import 'react-toastify/dist/ReactToastify.css';
import styled from '@emotion/styled';
import { alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { motion, AnimatePresence } from 'framer-motion';
import { IoGridOutline, IoListOutline } from 'react-icons/io5';
import Slide from '@mui/material/Slide';
import UsersInterface from './UsersInterface';
import { stringToColor, adjustColor, getInitials, getPlanColor } from '../../utils/colorUtils';
// TabPanel component to handle tab content
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
      style={{ width: '100%' }}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Estilos personalizados usando styled-components
const StyledBox = styled(Box)(({ theme }) => ({
  padding: '40px',
  background: 'linear-gradient(135deg, #f6f9fc 0%, #f1f5f9 100%)',
  minHeight: '100vh',
}));

// Update PageHeader styling
const PageHeader = styled(Box)(({ theme }) => ({
  marginBottom: '48px',
  textAlign: 'center',
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '-15px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '60px',
    height: '4px',
    background: '#8e3031',
    borderRadius: '2px',
  }
}));

const EnhancedTableContainer = styled(TableContainer)(({ theme }) => ({
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

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  '& .MuiTableCell-head': {
    background: '#f3f6f9',
    color: '#592d2d',
    fontWeight: 600,
    fontSize: '0.95rem',
    padding: '16px 24px',
    borderBottom: '1px solid #ebedf3',
    whiteSpace: 'nowrap',
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({

  '& .MuiTableCell-root': {
    padding: '16px 24px',
    borderBottom: '1px solid #ebedf3',
    color: '#7e8299',
  },
}));

// Update StatusChip colors to match the maroon/burgundy theme
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

// Update ActionButton colors to match the maroon/burgundy theme
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

}));

const UserManagement = () => {
  // Add tab state
  const [tabValue, setTabValue] = useState(0);
  
  // Fix the handleTabChange function definition
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Extraer el token desde Redux (asegúrate de que el path sea el correcto)
  const token = useSelector((state) => state.auth.accessToken);
  // Extrae el token y el userId desde Redux
  const userId = useSelector((state) =>  state.auth.user.userId);

  // Estado de usuarios (se obtendrán de la API)
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para el diálogo (crear/editar/eliminar)
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [selectedUser, setSelectedUser] = useState(null);

  // Estado del formulario (para crear/editar)
  // Update the default plan value in the initial state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    address: '',
    phone: '',
    contactInfo: '',
    additionalInfo: '',
    plan: 'Oro' // Changed from 'Básico' to 'Oro'
  });

  // Estado para el loading del envío del formulario
  const [formLoading, setFormLoading] = useState(false);

  // Paginación
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  // Obtener todos los usuarios desde la API cuando se monte el componente
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        // Changing the endpoint from /developer/clients to /clients
        const response = await axios.get('${import.meta.env.VITE_API_URL}/clients', {
          headers: {
            'Content-Type': 'application/json',
            'accesstoken': token
          }
        });
        
        console.log('Datos de clientes recibidos:', response.data);
        // Make sure we're accessing the correct property in the response
        setUsers(response.data.clients || []);
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar clientes:', err);
        setError('Error al cargar clientes');
        toast.error('Error al cargar clientes', { position: 'top-center' });
        setLoading(false);
      }
    };

    if (token) {
      fetchUsers();
    }
  }, [token]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Función para abrir el diálogo según la acción
  // Update the openDialog function to use 'Oro' as default
  const openDialog = (mode, user = null) => {
    setDialogMode(mode);
    setSelectedUser(user);
    if (mode === 'edit' && user) {
      setFormData({ 
        ...user,
        // Asegurarse de que todos los campos necesarios estén presentes
        contactInfo: user.contactInfo || '',
        additionalInfo: user.additionalInfo || '',
        plan: user.plan || 'Oro' // Changed from 'Básico' to 'Oro'
      });
    } else if (mode === 'create') {
      setFormData({ 
        name: '', 
        email: '', 
        password: '', 
        role: 'Client', // Por defecto, creamos clientes
        address: '', 
        phone: '',
        contactInfo: '',
        additionalInfo: '',
        plan: 'Oro' // Changed from 'Básico' to 'Oro'
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
  
    // Validación mínima: nombre y email obligatorios
    if (!formData.name || !formData.email) {
      toast.error('Nombre y Email son obligatorios', { position: 'top-center' });
      return;
    }

    // Validar que la contraseña esté presente para creación
    if (dialogMode === 'create' && !formData.password) {
      toast.error('La contraseña es obligatoria para crear un cliente', { position: 'top-center' });
      return;
    }
    
    // Validar que la contraseña tenga al menos 6 caracteres
    if (dialogMode === 'create' && formData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres', { position: 'top-center' });
      return;
    }
  
    if (formLoading) return;
    setFormLoading(true);
    
    try {
      if (dialogMode === 'create') {
        // Crear nuevo cliente - usando un objeto directo en lugar de JSON.stringify
        const clientData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: 'Client'
        };

        // Solo agregar campos opcionales si tienen valor
        if (formData.contactInfo || formData.phone) {
          clientData.contactInfo = formData.contactInfo || formData.phone;
        }
        if (formData.address) {
          clientData.address = formData.address;
        }
        if (formData.additionalInfo) {
          clientData.additionalInfo = formData.additionalInfo;
        }
        if (formData.plan) {
          clientData.plan = formData.plan;
        }

        console.log('Datos a enviar:', clientData);
        
        // Usar axios directamente sin config
        const response = await axios({
          method: 'post',
          url: '${import.meta.env.VITE_API_URL}/clients/register',
          headers: { 
            'Content-Type': 'application/json',
            'accesstoken': token
          },
          data: clientData
        });
        
        console.log('Cliente creado:', response.data);
        toast.success('Cliente creado exitosamente', { position: 'top-center' });
        
        // Actualizar la lista de usuarios y refrescar la lista
        setUsers(prevUsers => [...prevUsers, response.data.client || response.data]);
        closeDialog();
        
        // Refrescar la lista de clientes después de crear uno nuevo
        const refreshResponse = await axios.get('${import.meta.env.VITE_API_URL}/clients', {
          headers: {
            'Content-Type': 'application/json',
            'accesstoken': token
          }
        });
        setUsers(refreshResponse.data.clients || []);
      } else if (dialogMode === 'edit') {
        // Determina el ID del cliente a actualizar
        const clientId = selectedUser.clientId;
        
        if (!clientId) {
          console.error('Cliente sin clientId para editar:', selectedUser);
          toast.error('El cliente seleccionado no tiene un ID definido', { position: 'top-center' });
          setFormLoading(false);
          return;
        }
        
        // Datos para actualizar cliente
        const updateData = {
          contactInfo: formData.contactInfo || formData.phone,
          address: formData.address,
          additionalInfo: formData.additionalInfo,
          plan: formData.plan
        };

        // Actualizar cliente existente con el endpoint correcto usando clientId
        await axios.put(
          `${import.meta.env.VITE_API_URL}/clients/${clientId}`,
          updateData,
          {
            headers: {
              'Content-Type': 'application/json',
              'accesstoken': token
            }
          }
        );

        // Actualizar el estado local usando clientId
        const updatedUsers = users.map(user => {
          if (user.clientId === clientId) {
            return { ...user, ...updateData };
          }
          return user;
        });
        
        setUsers(updatedUsers);
        toast.success('Cliente actualizado exitosamente', { position: 'top-center' });
        closeDialog();
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
      toast.error('No se ha seleccionado ningún cliente para eliminar', { position: 'top-center' });
      return;
    }
  
    // Log the entire user object to see its structure
    console.log('Selected user for deletion:', selectedUser);
    
    // Use clientId for deletion, not userId
    const clientId = selectedUser.clientId;
    
    if (!clientId) {
      console.error('Cliente sin clientId:', selectedUser);
      toast.error('El cliente seleccionado no tiene un ID definido', { position: 'top-center' });
      return;
    }
  
    await deleteClient(clientId);
  };
  
  // Helper function to handle the actual deletion
  const deleteClient = async (clientId) => {
    try {
      console.log('Attempting to delete client with ID:', clientId);
      
      // Eliminar cliente con el endpoint correcto usando clientId
      await axios.delete(`${import.meta.env.VITE_API_URL}/clients/${clientId}`, {
        headers: {
          'Content-Type': 'application/json',
          'accesstoken': token
        }
      });
  
      // Actualizar estado local - use clientId for matching
      const updatedUsers = users.filter(user => user.clientId !== clientId);
      
      setUsers(updatedUsers);
      toast.success('Cliente eliminado correctamente', { position: 'top-center' });
      closeDialog();
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      toast.error(`Error al eliminar cliente: ${error.response?.data?.message || error.message}`, { position: 'top-center' });
    }
  };
  
  // Manejo inmediato del cambio de rol en la tabla
  const handleRoleChange = (userId, newRole) => {
    const updatedUsers = users.map((u) =>
      u.id === userId ? { ...u, role: newRole } : u
    );
    setUsers(updatedUsers);
    toast.success('Rol actualizado', { position: 'top-center' });
  };

  const currentUsers = users.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <StyledBox>
      <ToastContainer />
      
      <PageHeader>
        <Typography variant="h4" sx={{
          fontWeight: 700,
          color: '#181c32',
          mb: 1,
        }}>
          Gestión de Usuarios
        </Typography>
        <Typography variant="body1" sx={{ color: '#7e8299' }}>
          Administra y gestiona todos los usuarios del sistema
        </Typography>
      </PageHeader>

      {/* Tabs */}
      <Box sx={{ 
        width: '100%', 
        bgcolor: 'background.paper',
        borderRadius: '10px',
        boxShadow: '0 0 20px 0 rgba(82, 63, 105, 0.1)',
        mb: 3
      }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          centered
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: '#8e3031',
            },
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '1rem',
              color: '#7e8299',
              '&.Mui-selected': {
                color: '#8e3031',
                fontWeight: 600,
              },
  

   
            },
          }}
        >
          <Tab 
            icon={<PersonIcon />} 
            iconPosition="start" 
            label="Clientes" 
          />
          <Tab 
            icon={<PeopleIcon />} 
            iconPosition="start" 
            label="Usuarios" 
          />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        {/* Clients Tab Content - Your existing client management UI */}
        <EnhancedTableContainer>
          <TableToolbar>
            <SearchBar>
              <SearchIcon />
              <TextField
                placeholder="Buscar cliente..."
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
                  background: 'linear-gradient(135deg, #8e3031 0%, #592d2d 100%)',
                  color: 'white',
        
                }}
              >
                Nuevo Cliente
              </Button>
            </Box>
          </TableToolbar>

          {/* Rest of your client table code... */}
          <Table>
            <StyledTableHead>
              <TableRow>
                <TableCell>Usuario</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell>Plan</TableCell>
                <TableCell>Dirección</TableCell>
                <TableCell>Teléfono</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </StyledTableHead>
            <TableBody>
              {currentUsers.map((user, index) => {
                const userKey = user.id || user.userId || user.user_id || user._id || `user-${index}`;
                
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
                      <Box sx={{ 
                        display: 'inline-block',
                        px: 2,
                        py: 0.5,
                        borderRadius: '4px',
                        bgcolor: getPlanColor(user.plan),
                        color: 'white',
                        fontWeight: 'medium'
                      }}>
                        {user.plan || 'Oro'}
                      </Box>
                    </TableCell>
                    <TableCell>{user.address}</TableCell>
                    <TableCell>{user.phone || user.contactInfo}</TableCell>
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
              Mostrando {currentUsers.length} de {users.length} usuarios
            </Typography>
            <Pagination
              count={Math.ceil(users.length / rowsPerPage)}
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
                    borderColor: '#8e3031',
                    color: '#8e3031',
                  },
                },
              }}
            />
          </Box>
        </EnhancedTableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {/* Users Tab Content - Import from UsersInterface component */}
        <UsersInterface token={token} />
      </TabPanel>

      {/* Your existing dialogs */}
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
          {dialogMode === 'create' ? 'Crear Nuevo Cliente' : 'Editar Cliente'}
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
              disabled={dialogMode === 'edit'}
              required
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              margin="normal"
              disabled={dialogMode === 'edit'}
              required
            />
            {dialogMode === 'create' && (
              <TextField
                fullWidth
                label="Contraseña"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                margin="normal"
                required
              />
            )}
            <TextField
              fullWidth
              label="Dirección"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Teléfono"
              value={formData.phone || formData.contactInfo}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value, contactInfo: e.target.value })}
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Plan</InputLabel>
              <Select
                value={formData.plan || 'Oro'}
                onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                label="Plan"
              >
                <MenuItem value="Oro">Oro</MenuItem>
                <MenuItem value="Esmeralda">Esmeralda</MenuItem>
                <MenuItem value="Premium">Premium</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Información Adicional"
              value={formData.additionalInfo}
              onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
              margin="normal"
              multiline
              rows={3}
            />
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
              dialogMode === 'create' ? 'Crear Cliente' : 'Guardar Cambios'
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
            '& .MuiDialogTitle-root': {
              background: '#f1416c',
              color: 'white',
              padding: '20px 24px'
            }
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
            ¿Estás seguro de que deseas eliminar al cliente <strong>{selectedUser?.name}</strong>?
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
            Eliminar Cliente
          </ActionButton>
        </DialogActions>
      </Dialog>
    </StyledBox>
  );
};

  

export default UserManagement;
