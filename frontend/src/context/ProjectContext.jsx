// src/context/ProjectContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import qs from 'qs';

export const ProjectContext = createContext();

const API_BASE_URL = '${import.meta.env.VITE_API_URL}/projects';

export const ProjectProvider = ({ children }) => {
  const auth = useSelector((state) => state.auth);
  const accessToken = auth?.accessToken;

  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [projectStats, setProjectStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    inProgress: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', type: 'info' });

  // Configuración de axios con interceptores
  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    }
  });

  // Interceptor para añadir el token en cada petición
  axiosInstance.interceptors.request.use(
    (config) => {
      // Verificar que el token existe y tiene el formato correcto
      if (accessToken) {
        //console.log('Token siendo enviado:', accessToken);
        config.headers['Authorization'] = `Bearer ${accessToken}`;
        config.headers['accessToken'] = accessToken;
      } else {
        console.warn('No hay token disponible para la petición');
      }
      // ¡Log de la configuración final
      
      return config;
    },
    (error) => {
      console.error('Error en interceptor de request:', error);
      return Promise.reject(error);
    }
  );

  // Interceptor para manejar respuestas
  axiosInstance.interceptors.response.use(
    (response) => {
      
      return response;
    },
    (error) => {
      
      if (error.response?.status === 401) {
        showNotification('Error de autenticación. Verificando sesión...', 'error');
      }
      return Promise.reject(error);
    }
  );

  // GET /stats con verificación de token
  const fetchProjectStats = async () => {
    if (!accessToken) {
      console.warn('Intentando obtener stats sin token');
      return;
    }
    try {
      ////console.log.log('Obteniendo estadísticas con token:', accessToken);
      const response = await axiosInstance.get('/stats');
      if (response.data.success) {
        setProjectStats(response.data.stats);
      }
    } catch (error) {
      handleError(error, 'Error al obtener estadísticas');
    }
  };

  // GET / con verificación de token
  const fetchProjects = async (filters = {}) => {
    if (!accessToken) {
      console.warn('Intentando obtener proyectos sin token');
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.clientId) params.append('clientId', filters.clientId);
      if (filters.search) params.append('search', filters.search);

      const response = await axiosInstance.get(`/?${params}`);
      if (response.data.success) {
        setProjects(response.data.projects);
        setFilteredProjects(response.data.projects);
      }
    } catch (error) {
      handleError(error, 'Error al cargar los proyectos');
    } finally {
      setLoading(false);
    }
  };

  // Función auxiliar para manejar errores
  const handleError = (error, defaultMessage) => {
    const errorMessage = error.response?.data?.message || defaultMessage;
    console.error(defaultMessage, error);
    setError(errorMessage);
    setNotification({ open: true, message: errorMessage, type: 'error' });
  };

  // Efecto para cargar datos iniciales
  useEffect(() => {
    //////console.log.log('Estado de autenticación:', { auth, accessToken });
    if (accessToken) {
      //////console.log.log('Iniciando carga de datos con token:', accessToken);
      fetchProjects();
      fetchProjectStats();
    }
  }, [accessToken]);

  // Función para filtrar proyectos
  const filterProjects = (filters = {}) => {
    let filtered = [...projects];

    if (filters.status) {
      filtered = filtered.filter(p => p.status === filters.status);
    }

    if (filters.clientId) {
      filtered = filtered.filter(p => p.clientId === filters.clientId);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.projectName.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredProjects(filtered);
  };

  // Función para crear proyecto
  const createProject = async (projectData) => {
    try {
      const dataToSubmit = {
        clientId: Number(projectData.clientId),
        projectName: projectData.projectName,
        description: projectData.description || null,
        status: projectData.status || 'Pending'
      };

      const response = await axiosInstance.post('/', dataToSubmit);
      
      if (response.data.success) {
        await fetchProjects();
        await fetchProjectStats();
        showNotification(response.data.message, 'success');
      }
      return response.data.project;
    } catch (error) {
      handleError(error, 'Error al crear el proyecto');
      throw error;
    }
  };

  // 4. Obtener Proyecto por ID
  const getProjectById = async (id) => {
    try {
      const response = await axiosInstance.get(`/${id}`);
      return response.data;
    } catch (error) {
      handleError(error, 'Error al obtener el proyecto');
      throw error;
    }
  };

  // 6. Actualizar Estado
  const updateProjectStatus = async (id, status) => {
    try {
      const response = await axiosInstance.patch(`/${id}/status`, { status });
      if (response.data.success) {
        await fetchProjects();
        await fetchProjectStats();
        showNotification(response.data.message, 'success');
      }
      return response.data.project;
    } catch (error) {
      handleError(error, 'Error al actualizar el estado');
      throw error;
    }
  };

  // 7. Eliminar Proyecto
  const deleteProject = async (id) => {
    try {
      const response = await axiosInstance.delete(`/${id}`);
      if (response.data.success) {
        await fetchProjects();
        await fetchProjectStats();
        showNotification(response.data.message, 'success');
      }
    } catch (error) {
      handleError(error, 'Error al eliminar el proyecto');
      throw error;
    }
  };

  // 8. Obtener Proyectos por Cliente 
  const getProjectsByClient = async (clientId) => {
    try {
      const response = await axiosInstance.get(`/client/${clientId}`);
      return response.data.projects || [];
    } catch (error) {
      handleError(error, 'Error al obtener proyectos por cliente');
      throw error;
    }
  };

  // Actualizar la función getAllClients para obtener los nombres de los clientes
  const getAllClients = async () => {
    try {
      const response = await axiosInstance.get('/clients', {
        baseURL: '${import.meta.env.VITE_API_URL}/projects'
      });
      
      //console.log.log('Respuesta de clientes:', response.data);
      
      // Verificar la estructura de la respuesta
      if (!response.data || !response.data.clients) {
        console.error('Formato de respuesta inesperado:', response.data);
        return [];
      }
      
      // Mapear los clientes para incluir nombre y ID
      return response.data.clients.map(client => {
        // Asegurarse de que cada cliente tenga un ID y un nombre
        return {
          id: client.clientId || client.id,
          clientId: client.clientId || client.id,
          name: client.clientName || client.name || `Cliente ${client.clientId || client.id}`
        };
      });
    } catch (error) {
      handleError(error, 'Error al obtener clientes');
      return []; // Devolver array vacío en caso de error
    }
  };

  // Función para mostrar notificaciones
  const showNotification = (message, type = 'info') => {
    setNotification({
      open: true,
      message,
      type
    });
  };

  // Alternativa usando form-urlencoded
  const updateProject = async (projectId, projectData) => {
    try {
      if (!projectId) {
        throw new Error('ID de proyecto no proporcionado');
      }

      const response = await axiosInstance.put(`/${projectId}`, projectData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      //console.log.log('Respuesta de actualización:', response.data);

      if (response.data.success) {
        await fetchProjects(); // Recargar la lista completa
        await fetchProjectStats(); // Actualizar estadísticas
        showNotification(response.data.message || 'Proyecto actualizado exitosamente', 'success');
      }

      return response.data.project;
    } catch (error) {
      console.error('Error al actualizar el proyecto:', error.response?.data || error.message);
      handleError(error, 'Error al actualizar el proyecto');
      throw error;
    }
  };

  const contextValue = {  
    projects,
    filteredProjects,
    projectStats,
    loading,
    error,
    notification,
    setNotification,
    createProject,
    fetchProjects,
    filterProjects,
    getProjectById,
    updateProject,
    updateProjectStatus,  
    deleteProject,
    getProjectsByClient,
    getAllClients,
    fetchProjectStats
  };

  return (  
    <ProjectContext.Provider value={contextValue}>
      {children}
    </ProjectContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject debe ser usado dentro de un ProjectProvider');
  }
  return context;
};

export default ProjectProvider;   

