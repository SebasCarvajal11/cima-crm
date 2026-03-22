// src/pages/projects/components/ProjectForm.js
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
  Typography,
  Chip,
  Avatar,
  Fade,
  IconButton,
  Tooltip,
  Box,
  Divider,
  Alert,
  FormHelperText
} from '@mui/material';
import {
  Business as BusinessIcon,
  Description as DescriptionIcon,
  Assignment as AssignmentIcon,
  Close as CloseIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import { useProject } from '../../../context/ProjectContext';
import StatusChip from '../StatusChip';

// Estilos personalizados
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 16,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    overflowX: 'hidden'
  }
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  background: '#000000',
  color: '#ffffff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(2),
}));

const FormSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  '& .MuiFormControl-root': {
    marginBottom: theme.spacing(2),
  },
  '& .MuiOutlinedInput-root': {
    '&:hover fieldset': {
      borderColor: '#8e3031',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#592d2d',
    }
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#592d2d',
  }
}));

const ProjectForm = ({ open, onClose, onSubmit, project = null }) => {
  const { getAllClients } = useProject();
  const [formData, setFormData] = useState({
    clientId: '',
    projectName: '',
    description: '',
    status: 'Pending'
  });
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (project) {
      setFormData({
        clientId: project.clientId || '',
        projectName: project.projectName || '',
        description: project.description || '',
        status: project.status || 'Pending'
      });
    } else {
      setFormData({
        clientId: '',
        projectName: '',
        description: '',
        status: 'Pending'
      });
    }
    console.log('index ', formData.clientId.id)
  }, [project, open]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use axios to fetch clients directly from the endpoint
        const response = await axios.get('${import.meta.env.VITE_API_URL}/clients', {
          headers: {
            'accesstoken': localStorage.getItem('accessToken') // Assuming you store the token in localStorage
          }
        });
        
        // Extract clients from the response
        const clientsData = response.data.clients || [];
        
        // Add detailed logging to see client data
        console.log('Clientes obtenidos (raw data):', clientsData);
        
        // Transform client data to match the expected format
        const formattedClients = clientsData.map((client, index) => ({
          id: client.clientId, // Generate an id if not provided by API // Generate a clientId if not provided by API
          name: client.name,
          email: client.email,
          address: client.address
        }));
        
        console.log('Clientes formateados:', formattedClients);
        
        setClients(formattedClients);
      } catch (error) {
        console.error('Error al cargar clientes:', error);
        console.error('Detalles del error:', error.response?.data || error.message);
        setError('No se pudieron cargar los clientes. Por favor, inténtelo de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchClients();
    }
  }, [open]); // Removed getAllClients dependency since we're using direct API call

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'clientId' ? (value ? parseInt(value, 10) : '') : value
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid()) return;

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      setError('Error al procesar el formulario. Por favor, inténtelo de nuevo.');
    }
  };

  const isValid = () => formData.clientId && formData.projectName;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'warning';
      case 'In Progress': return 'info';
      case 'Completed': return 'success';
      default: return 'default';
    }
  };

  const statusOptions = [
    { value: 'Pending', label: 'Pendiente' },
    { value: 'In Progress', label: 'En Progreso' },
    { value: 'Completed', label: 'Completado' }
  ];

  return (
    <StyledDialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      TransitionComponent={Fade}
      transitionDuration={300}
    >
      <StyledDialogTitle>
        <Box display="flex" alignItems="center">
          <AssignmentIcon sx={{ mr: 1, color: '#000000' }} />
          <Typography variant="h6">
            {project ? 'Editar Proyecto' : 'Crear Nuevo Proyecto'}
          </Typography>
        </Box>
        <IconButton 
          onClick={onClose}
          size="small"
          sx={{ color: '#000000' }}
        >
          <CloseIcon />
        </IconButton>
      </StyledDialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ 
          pt: 3,
          overflowX: 'hidden' // Prevents horizontal scrolling
        }}>
          {loading ? (
            <Box display="flex" justifyContent="center" my={3}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box my={2}>
              <Alert severity="error">{error}</Alert>
            </Box>
          ) : (
            <>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormSection>
                    <Box display="flex" alignItems="center" mb={2}>
                      <BusinessIcon sx={{ mr: 1, color: '#592d2d' }} />
                      <Typography variant="subtitle1" sx={{ color: '#592d2d' }}>
                        Información del Cliente
                      </Typography>
                    </Box>
                    <FormControl fullWidth error={!!error}>
                      <InputLabel>Seleccionar Cliente</InputLabel>
                      <Select
                        name="clientId"
                        value={formData.clientId}
                        onChange={handleChange}
                        label="Seleccionar Cliente"
                        required
                        disabled={loading}
                      >
                        {clients && clients.length > 0 ? (
                          clients.map(client => (
                            // Update the client display in the MenuItem
                            <MenuItem key={client.id} value={client.id}>
                              <Box display="flex" alignItems="center" width="100%">
                                <Avatar 
                                  sx={{ 
                                    width: 32, 
                                    height: 32, 
                                    mr: 1.5,
                                    bgcolor: client.id % 2 === 0 ? '#8e3031' : '#592d2d'
                                  }}
                                >
                                  {client.name ? client.name.charAt(0).toUpperCase() : `C${client.id}`}
                                </Avatar>
                                <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                                  <Typography variant="body1" fontWeight="600" sx={{ color: '#592d2d' }}>
                                    {client.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {client.email}
                                  </Typography>
                                </Box>
                              </Box>
                            </MenuItem>
                          ))
                        ) : (
                          <MenuItem disabled value="">
                            No hay clientes disponibles
                          </MenuItem>
                        )}
                      </Select>
                      {error && <FormHelperText error>{error}</FormHelperText>}
                    </FormControl>
                  </FormSection>

                  <Divider sx={{ my: 3 }} />

                  <FormSection>
                    <Box display="flex" alignItems="center" mb={2}>
                      <DescriptionIcon sx={{ mr: 1, color: '#592d2d' }} />
                      <Typography variant="subtitle1" sx={{ color: '#592d2d' }}>
                        Detalles del Proyecto
                      </Typography>
                    </Box>
                    
                    <TextField
                      name="projectName"
                      label="Nombre del Proyecto"
                      fullWidth
                      value={formData.projectName}
                      onChange={handleChange}
                      required
                      variant="outlined"
                    />

                    <TextField
                      name="description"
                      label="Descripción"
                      fullWidth
                      multiline
                      rows={4}
                      value={formData.description}
                      onChange={handleChange}
                      variant="outlined"
                      placeholder="Describe los detalles del proyecto..."
                    />
                  </FormSection>

                  <FormSection>
                    <Box display="flex" alignItems="center" mb={2}>
                      <ScheduleIcon sx={{ mr: 1, color: '#592d2d' }} />
                      <Typography variant="subtitle1" sx={{ color: '#592d2d' }}>
                        Estado del Proyecto
                      </Typography>
                    </Box>
                    
                    <FormControl fullWidth>
                      <InputLabel sx={{ '&.Mui-focused': { color: '#592d2d' } }}>
                        Estado
                      </InputLabel>
                      <Select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        label="Estado"
                        sx={{
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#8e3031',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#592d2d',
                          }
                        }}
                      >
                        {statusOptions.map(option => (
                          <MenuItem key={option.value} value={option.value}>
                            <StatusChip
                              label={option.label}
                              status={option.value}
                              size="small"
                            />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </FormSection>
                </Grid>
              </Grid>
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, bgcolor: 'grey.50' }}>
          <Button 
            onClick={onClose} 
            sx={{
              color: '#ffffff',
              backgroundColor: '#000000',
              borderColor: '#000000',
              '&:hover': {
                backgroundColor: '#333333',
                borderColor: '#333333',
              }
            }}
            variant="contained"
            startIcon={<CloseIcon />}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={!isValid() || loading}
            sx={{ 
              ml: 2,
              color: '#ffffff',
              bgcolor: '#000000',
              '&:hover': {
                bgcolor: '#333333',
              },
              '&.Mui-disabled': {
                bgcolor: 'rgba(0, 0, 0, 0.3)',
                color: 'rgba(255, 255, 255, 0.7)'
              }
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : project ? (
              'Actualizar Proyecto'
            ) : (
              'Crear Proyecto'
            )}
          </Button>
        </DialogActions>
      </form>
    </StyledDialog>
  );
};

export default ProjectForm;
