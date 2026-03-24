import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Alert,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  FileCopy as FileIcon,
  FolderOpen as ProjectIcon,
  InsertDriveFile as DocumentIcon,
  CloudQueue as CloudIcon,
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { Grid, Stack, Chip } from '@mui/material';

const DropzoneArea = styled('div')(({ theme }) => ({
  border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
  borderRadius: theme.shape.borderRadius * 3,
  padding: theme.spacing(6),
  textAlign: 'center',
  cursor: 'pointer',
  backgroundColor: alpha(theme.palette.primary.main, 0.02),
  transition: 'all 0.3s ease',
  backdropFilter: 'blur(8px)',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
    borderColor: theme.palette.primary.main,
    transform: 'translateY(-2px)',
    boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.12)}`,
  },
}));

const FileCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius * 2,
  transition: 'all 0.3s ease',
  border: '1px solid',
  borderColor: alpha(theme.palette.divider, 0.1),
  background: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(8px)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.08)}`,
  },
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
  overflow: 'hidden',
  border: '1px solid',
  borderColor: theme.palette.divider,
  '& .MuiTableCell-head': {
    backgroundColor: "#8e3031",
    color: theme.palette.common.white,
    fontWeight: 600,
    fontSize: '0.95rem',
    padding: theme.spacing(2),
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  '& .MuiTableRow-root': {
    transition: 'all 0.3s ease',
    borderBottom: `1px solid ${theme.palette.divider}`,
    color: '#000000',
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.04),
      transform: 'translateY(-1px)',
    },
  },
  '& .file-name': {
    fontWeight: 500,
    color: "#8e3031",
  },
  '& .file-info': {
    color: '#000000',
    fontSize: '0.875rem',
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #f6f9fc 0%, #ffffff 100%)',
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
  marginBottom: theme.spacing(4),
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
  },
}));

const ExcelImport = ({ projectId = 42 }) => {
  // Add console log to check projectId when component mounts
  useEffect(() => {
    console.log('Component mounted with projectId:', projectId);
  }, []);

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, fileId: null });

  // Fetch projects
  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        '${import.meta.env.VITE_API_URL}/projects',
        {
          headers: { 'accesstoken': token }
        }
      );
      const projectsData = response.data.projects || [];
      setProjects(projectsData);
    } catch (err) {
      console.error('Projects fetch error:', err);
      setError('Error al cargar los proyectos');
      setProjects([]);
    }
  };

  // Handle project selection
  const handleProjectChange = (event) => {
    setSelectedProject(event.target.value);
    if (event.target.value) {
      fetchFiles(event.target.value);
    } else {
      setFiles([]);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Modified fetchFiles to use selectedProject
  const fetchFiles = async (projectId) => {
    if (!projectId) return;
    
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('No hay sesión activa');
      return;
    }

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/files/project/${projectId}`,
        {
          headers: { 'accesstoken': token }
        }
      );
      setFiles(response.data.files || []);
    } catch (err) {
      setError('Error al cargar los archivos');
    }
  };

  // Add handleDownload function
  const handleDownload = async (fileId) => {
    if (!fileId) {
      setError('ID de archivo no válido');
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('No hay sesión activa');
      return;
    }

    try {
      setLoading(true);
      
      // Make request to download endpoint
      const response = await axios({
        method: 'get',
        url: `${import.meta.env.VITE_API_URL}/files/download/${fileId}`,
        headers: { 'accesstoken': token },
      });
      
      // Extract file data from response
      const { fileName, mimeType } = response.data.fileData;
      
      // Create a blob from the base64 content
      const byteCharacters = atob(response.data.fileData.base64Content);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });
      
      // Create URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link element and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      setSuccess('Archivo descargado correctamente');
    } catch (err) {
      console.error('Error al descargar archivo:', err);
      setError(`Error al descargar archivo: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Add handleDelete function
  const handleDelete = async (fileId) => {
    if (!fileId) {
      setError('ID de archivo no válido');
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('No hay sesión activa');
      return;
    }

    try {
      setLoading(true);
      
      // Delete file using API
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/files/${fileId}`,
        {
          headers: { 'accesstoken': token }
        }
      );
      
      // Update local state
      setFiles(files.filter(file => file.fileId !== fileId));
      setSuccess('Archivo eliminado correctamente');
      
      // Close the confirmation dialog
      setConfirmDelete({ open: false, fileId: null });
    } catch (err) {
      console.error('Error al eliminar archivo:', err);
      setError(`Error al eliminar archivo: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // In the useDropzone configuration, remove the accept restriction to allow all file types
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;
      
      if (!selectedProject) {
        setError('Por favor seleccione un proyecto primero');
        return;
      }

      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('No hay sesión activa');
        return;
      }

      setLoading(true);
      setError(null);
      setSuccess(null);

      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/files/${selectedProject}`,
          formData,
          {
            headers: {
              'accesstoken': token,
              'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (progressEvent) => {
              const progress = (progressEvent.loaded / progressEvent.total) * 100;
              setUploadProgress(Math.round(progress));
            }
          }
        );
        setSuccess('Archivo subido exitosamente');
        fetchFiles(selectedProject);
      } catch (err) {
        setError(`Error al subir el archivo: ${err.response?.data?.message || err.message}`);
      } finally {
        setLoading(false);
        setUploadProgress(0);
      }
    },
    // Remove the accept restriction to allow all file types
    maxSize: 10 * 1024 * 1024, // Increased to 10MB
    multiple: false
  });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper 
        elevation={0}
        sx={{ 
          p: 4, 
          mb: 4,
          borderRadius: 4,
          background: 'linear-gradient(135deg, #f8faff 0%, #ffffff 100%)',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.05)',
        }}
      >
        <Box sx={{ mb: 4 }}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700, 
                color: 'primary.main', 
                mb: 1,
                background: 'linear-gradient(90deg, #592d2d, #592d2d)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Gestor de Documentos
            </Typography>
            <Typography variant="subtitle1" color="#000000" sx={{ mb: 4 }}>
              Gestiona y organiza archivos de cualquier tipo para tus proyectos
            </Typography>

          
            <CardContent sx={{ p: 3  }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    backgroundColor: 'primary.lighter',
                    borderRadius: '50%',
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ProjectIcon sx={{ color: '#592d2d', fontSize: 28 }} />
                </Box>
                <FormControl fullWidth>
                  <InputLabel>Seleccionar Proyecto</InputLabel>
                  <Select
                    value={selectedProject}
                    onChange={handleProjectChange}
                    label="Seleccionar Proyecto"
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#000000',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#592d2d',
                      },
                    }}
                  >
                    <MenuItem value="">
                      <em>Seleccione un proyecto</em>
                    </MenuItem>
                    {projects.map((project) => (
                        console.log(project),
                      <MenuItem key={project.projectId} value={project.projectId}>
                        {project.projectName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </CardContent>
         

          {selectedProject ? (
            <>
              <DropzoneArea {...getRootProps()}>
                <input {...getInputProps()} />
                <Box 
                  sx={{ 
                    p: 4, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    background: 'linear-gradient(135deg, #f8faff 0%, #ffffff 100%)',
                    borderRadius: 3,
                  }}
                >
                  <Box
                    sx={{
                      backgroundColor: 'primary.lighter',
                      borderRadius: '50%',
                      p: 2,
                      mb: 2,
                    }}
                  >
                    <UploadIcon sx={{ fontSize: 40, color: '#8e3031' }} />
                  </Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Arrastra archivos aquí
                  </Typography>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    o haz clic para seleccionar
                  </Typography>
                  <Box 
                    sx={{ 
                      mt: 2, 
                      p: 1.5, 
                      bgcolor: 'background.paper', 
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Tamaño máximo permitido: 10MB
                    </Typography>
                  </Box>
                </Box>
              </DropzoneArea>

              {loading && (
                <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Subiendo archivo...
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={uploadProgress}
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                      }
                    }} 
                  />
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                    {uploadProgress}%
                  </Typography>
                </Box>
              )}

              {error && (
                <Alert 
                  severity="error" 
                  sx={{ mt: 3, borderRadius: 2 }}
                  variant="filled"
                >
                  {error}
                </Alert>
              )}

              {success && (
                <Alert 
                  severity="success" 
                  sx={{ mt: 3, borderRadius: 2 }}
                  variant="filled"
                >
                  {success}
                </Alert>
              )}

              <StyledTableContainer sx={{ mt: 4 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Archivo</TableCell>
                      <TableCell>Información</TableCell>
                      <TableCell>Tamaño</TableCell>
                      <TableCell>Descargar</TableCell>
                      <TableCell align="right">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {files.map((file) => (
                      <TableRow key={file.fileId}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <FileIcon sx={{ mr: 2, color: '#592d2d' }} />
                            <Typography className="file-name" sx={{ color: '#000000' }}>
                              {file.originalName || 'Sin nombre'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell className="file-info">
                          <Typography variant="body2" sx={{ color: '#000000' }}>
                            Subido el: {file.uploadedAt ? new Date(file.uploadedAt).toLocaleString('es-ES') : 'Fecha no disponible'}
                          </Typography>
                        </TableCell>
                        <TableCell className="file-info">
                          <Typography variant="body2" sx={{ color: '#000000' }}>
                            {file.fileSize ? `${(file.fileSize / 1024).toFixed(2)} KB` : 'Tamaño no disponible'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            startIcon={<DownloadIcon />}
                            onClick={() => handleDownload(file.fileId)}
                            sx={{ 
                              backgroundColor: '#592d2d',
                              '&:hover': {
                                backgroundColor: '#8e3031',
                              }
                            }}
                          >
                            Descargar
                          </Button>
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                            <Tooltip title="Eliminar archivo">
                              <IconButton 
                                onClick={() => setConfirmDelete({ open: true, fileId: file.fileId })}
                                sx={{ 
                                  color: 'error.main',
                                  '&:hover': { 
                                    backgroundColor: 'error.light',
                                    color: 'error.dark'
                                  }
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </StyledTableContainer>
            </>
          ) : (
            <Box 
              sx={{ 
                textAlign: 'center', 
                py: 8, 
                bgcolor: 'background.paper',
                borderRadius: 4,
                border: '1px dashed',
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <ProjectIcon sx={{ fontSize: 48, color: '#592d2d', opacity: 0.5 }} />
              <Typography variant="h6" color="text.secondary">
                Seleccione un proyecto para gestionar sus documentos
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>

      <Dialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, fileId: null })}
        PaperProps={{
          sx: {
            borderRadius: 2,
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ color: 'error.main' }}>
          Confirmar eliminación
        </DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar este archivo? Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button 
            onClick={() => setConfirmDelete({ open: false, fileId: null })}
            variant="outlined"
          >
            Cancelar
          </Button>
          <Button 
            onClick={() => handleDelete(confirmDelete.fileId)}
            color="error"
            variant="contained"
            startIcon={<DeleteIcon />}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ExcelImport;
