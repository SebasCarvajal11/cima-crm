// src/pages/projects/ProjectsPage.js
import React, { useState, useContext, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Paper,
  Fade,
  Alert,
  Snackbar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { ProjectContext } from '../../../context/ProjectContext';
import ProjectList from '../components/ProjectList';
import ProjectForm from '../components/ProjectForm';
import ProjectStats from '../components/ProjectStats';

const ProjectsPage = () => {
  const projectContext = useContext(ProjectContext);
  
  if (!projectContext) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ py: 4 }}>
          <Alert severity="error">
            Error: ProjectContext no está disponible. Asegúrate de que este componente esté dentro de un ProjectContextProvider.
          </Alert>
        </Box>
      </Container>
    );
  }
  
  const {
    projects,
    filteredProjects,
    projectStats,
    loading,
    error,
    notification,
    setNotification,
    createProject,
    deleteProject,
    fetchProjects,
    updateProject,
    showNotification
  } = projectContext;

  const [openForm, setOpenForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [openEditForm, setOpenEditForm] = useState(false);

  // Asegurarse de cargar los proyectos cuando el componente se monta
  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (projectData) => {
    try {
      await createProject(projectData);
      fetchProjects(); // Recargar la lista después de crear
      setOpenForm(false);
    } catch (error) {
      console.error('Error al crear proyecto:', error);
    }
  };

  const handleEdit = (project) => {
    setSelectedProject(project);
    setOpenEditForm(true);
  };

  const handleUpdateProject = async (formData) => {
    try {
      if (!selectedProject?.id) {
        showNotification('No se ha seleccionado ningún proyecto para actualizar', 'error');
        return;
      }

      //console.log.log('Actualizando proyecto:', selectedProject.id, formData);

      // Formatear los datos según lo requiere el backend
      const projectData = {
        clientId: Number(formData.clientId),
        projectName: formData.projectName,
        description: formData.description || '',
        status: formData.status
      };

      await updateProject(selectedProject.id, projectData);
      setOpenEditForm(false);
      showNotification('Proyecto actualizado exitosamente', 'success');
    } catch (error) {
      console.error('Error en la actualización:', error);
      showNotification('Error al actualizar el proyecto', 'error');
    }
  };

  const handleDeleteProject = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este proyecto?')) {
      try {
        await deleteProject(id);
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Container maxWidth="xl">
      <Fade in={true}>
        <Box sx={{ py: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h4" component="h1" sx={{ color: '#592d2d' }}>
                  Gestión de Proyectos
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenForm(true)}
                  sx={{
                    bgcolor: 'black',
                    '&:hover': {
                      bgcolor: '#333333'
                    }
                  }}
                >
                  Nuevo Proyecto
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <ProjectStats stats={projectStats} />
            </Grid>

            <Grid item xs={12}>
              <Paper>
                <ProjectList
                  projects={filteredProjects}
                  loading={loading}
                  onEdit={handleEdit}
                  onDelete={handleDeleteProject}
                />
              </Paper>
            </Grid>
          </Grid>

          <ProjectForm
            open={openForm}
            onClose={() => {
              setOpenForm(false);
              setSelectedProject(null);
            }}
            onSubmit={handleCreateProject}
          />

          <ProjectForm
            open={openEditForm}
            onClose={() => {
              setOpenEditForm(false);
              setSelectedProject(null);
            }}
            onSubmit={handleUpdateProject}
            project={selectedProject}
          />

          <Snackbar
            open={notification.open}
            autoHideDuration={6000}
            onClose={handleCloseNotification}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Alert
              onClose={handleCloseNotification}
              severity={notification.type}
              sx={{ width: '100%' }}
            >
              {notification.message}
            </Alert>
          </Snackbar>
        </Box>
      </Fade>
    </Container>
  );
};

export default ProjectsPage;
