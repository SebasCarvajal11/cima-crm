import React, { useState, useEffect } from 'react';
import axios from 'axios';  
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Typography,
  Chip,
  InputAdornment,
  Select,
  FormControl,
  InputLabel,
  Avatar,
  Tooltip,
  CircularProgress,
  Alert,
  Snackbar,
  Checkbox,
  FormControlLabel,
  Tabs,
  Tab,
  Divider,
  Grid,
  Paper
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  HourglassEmpty as PendingIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  DateRange as DateRangeIcon,
  BarChart as BarChartIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { taskService } from '../../services/taskService';
import { toast } from 'react-toastify';
import './TaskManagement.css';
import { useSelector } from 'react-redux';

const TaskManagement = () => {
  // Estado para el usuario actual
  const { user, token } = useSelector((state) => state.auth);
  const isAdmin = user && user.role === 'Admin';
  // Añadir este estado para los trabajadores
  const [allWorkers, setAllWorkers] = useState([]);
  // Estados para tareas
  const [tasks, setTasks] = useState([]); // Inicializado como arreglo vacío
  const [error, setError] = useState(null);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  // Estados para diálogos
  const [open, setOpen] = useState(false);
  const [bulkActionOpen, setBulkActionOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('');
  const [workerFilter, setWorkerFilter] = useState('');
  const [dateRangeFilter, setDateRangeFilter] = useState({
    startDate: '',
    endDate: ''
  });
  
  // Estado para estadísticas
  const [taskStats, setTaskStats] = useState(null);
  
  // Estado para formulario
  const [formData, setFormData] = useState({
    projectId: '',
    workerId: '',
    description: '',
    status: 'Pending'
  });
  
  // Estado para acciones en masa
  const [bulkAction, setBulkAction] = useState({
    action: 'status',
    status: 'Completed',
    workerId: ''
  });

  // Estado para pestañas
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    loadTasks();
    fetchAllProjects(); // Fetch projects on component mount
    fetchAllWorkers(); 
  }, []);

  useEffect(() => {
    filterTasks();
  }, [tasks, searchTerm, statusFilter, projectFilter, workerFilter]);
  const fetchAllProjects = async () => {
    try {
      // Using the correct endpoint for projects
      const response = await axios.get(`http://localhost:3000/developer/projects`, getHeaders());
      
      if (response.data.success && Array.isArray(response.data.projects)) {
        setAllProjects(response.data.projects, "esto es response");
      } else {
        console.error('Invalid response format for projects:', response.data);
        setAllProjects([]);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setAllProjects([]);
    }
  };
  // Helper function to get headers with token
const getHeaders = () => {
  const accessToken = token || localStorage.getItem('accessToken');
  return {
    headers: {
      'accessToken': accessToken
    }
  };
};
// Add this function to fetch all workers
const fetchAllWorkers = async () => {
  try {
    // Intentar obtener el token de Redux, y si no está disponible, del localStorage
    const accessToken = token || localStorage.getItem('accessToken');
    
    if (!accessToken) {
      console.error('No hay token disponible');
      return;
    }
    
    const response = await axios.get(
      '${import.meta.env.VITE_API_URL}/users/workers',
      {
        headers: {
          'accessToken': accessToken
        }
      }
    );
    
    if (response.data.success && Array.isArray(response.data.workers)) {
      setAllWorkers(response.data.workers);
    } else {
      console.error('Invalid response format for workers:', response.data);
      setAllWorkers([]);
    }
  } catch (error) {
    console.error('Error fetching workers:', error);
    setAllWorkers([]);
  }
};
  const loadTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      let response;
      
      // Usar el endpoint adecuado según los filtros aplicados
      if (projectFilter && !workerFilter && !statusFilter) {
        console.log('Fetching tasks by project:', projectFilter);
        response = await taskService.getTasksByProject(projectFilter);
        console.log('Tasks by project response:', response);
      } else if (!projectFilter && workerFilter && !statusFilter) {
        console.log('Fetching tasks by worker:', workerFilter);
        response = await taskService.getTasksByWorker(workerFilter);
        console.log('Tasks by worker response:', response);
      } else if (!projectFilter && !workerFilter && statusFilter !== 'all') {
        console.log('Fetching tasks by status:', statusFilter);
        response = await taskService.getTasksByStatus(statusFilter);
        console.log('Tasks by status response:', response);
      } else {
        // Si hay múltiples filtros o ninguno, usar el endpoint detallado
        const filters = {};
        if (projectFilter) filters.projectId = projectFilter;
        if (workerFilter) filters.workerId = workerFilter;
        if (statusFilter !== 'all') filters.status = statusFilter;
        
        console.log('Fetching detailed tasks with filters:', filters);
        response = await taskService.getDetailedTasks(filters);
        console.log('Detailed tasks response:', response);
      }
      
      // Extraer el arreglo de tareas de la respuesta
      const tasksArray = response.tasks || response;
      console.log('Extracted tasks array:', tasksArray);
      
      setTasks(Array.isArray(tasksArray) ? tasksArray : []);
      setFilteredTasks(Array.isArray(tasksArray) ? tasksArray : []);
    } catch (error) {
      console.error('Error al cargar tareas:', error);
      console.error('Error details:', error.response?.data || error.message);
      setError('Error al cargar las tareas. Por favor, intente nuevamente.');
      
      // Datos de ejemplo para desarrollo
      const mockTasks = [
        { id: 1, projectId: 101, workerId: 201, description: 'Desarrollar página de inicio', status: 'Pending', createdAt: '2023-05-15' },
        { id: 2, projectId: 102, workerId: 202, description: 'Implementar autenticación de usuarios', status: 'In Progress', createdAt: '2023-05-16' },
        { id: 3, projectId: 101, workerId: 203, description: 'Diseñar interfaz de usuario para dashboard', status: 'Completed', createdAt: '2023-05-10' },
        { id: 4, projectId: 103, workerId: 201, description: 'Optimizar consultas de base de datos', status: 'In Progress', createdAt: '2023-05-18' },
        { id: 5, projectId: 102, workerId: 204, description: 'Crear API para gestión de tareasSSSS', status: 'Pending', createdAt: '2023-05-20' },
        { id: 6, projectId: 104, workerId: 205, description: 'Implementar sistema de notificaciones', status: 'Completed', createdAt: '2023-05-12' },
      ];
      console.log('Using mock tasks due to error');
      setTasks(mockTasks);
      setFilteredTasks(mockTasks);
    } finally {
      setLoading(false);
    }
  };

  // Cargar estadísticas de tareas (solo para Admin)
  const loadTaskStats = async () => {
    if (!isAdmin) return;
    
    try {
      console.log('Fetching task statistics');
      const response = await taskService.getTaskStats();
      console.log('Task statistics response:', response);
      setTaskStats(response);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      console.error('Error details:', error.response?.data || error.message);
      toast.error('No se pudieron cargar las estadísticas');
      
      // Valores por defecto para evitar errores en el mapeo
      setTaskStats({
        success: false,
        stats: {
          completed: 0,
          inProgress: 0,
          pending: 0,
          total: 0,
          totalProjects: 0,
          totalWorkers: 0
        }
      });
    }
  };

  const filterTasks = () => {
    if (!Array.isArray(tasks)) {
      console.error('Tasks is not an array:', tasks);
      setFilteredTasks([]);
      return;
    }
  
    let result = [...tasks];
    
    // Filtrar por término de búsqueda (incluye nombre de proyecto)
    if (searchTerm) {
      result = result.filter(task => 
        task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.projectName && task.projectName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Filtrar por estado - corregido para que funcione siempre que no sea "all"
    if (statusFilter !== 'all') {
      result = result.filter(task => task.status === statusFilter);
    }
    
    // Filtrar por proyecto
    if (projectFilter) {
      result = result.filter(task => task.projectId.toString() === projectFilter.toString());
    }
    
    // Filtrar por trabajador
    if (workerFilter) {
      result = result.filter(task => task.workerId.toString() === workerFilter.toString());
    }
    
    setFilteredTasks(result);
  };

// Modify handleOpen to fetch projects when opening the dialog
const handleOpen = (task = null) => {
  fetchAllWorkers(); // Fetch all workers when opening the dialog
  fetchAllProjects(); // Fetch all projects when opening the dialog
  
  if (task) {
    setSelectedTask(task);
    setFormData({
      projectId: task.projectId,
      workerId: task.workerId,
      description: task.description,
      status: task.status
    });
  } else {
    setSelectedTask(null);
    setFormData({
      projectId: '',
      workerId: '',
      description: '',
      status: 'Pending'
    });
  }
  setOpen(true);
};

  const handleClose = () => {
    setOpen(false);
    setSelectedTask(null);
  };
// In the handleSubmit function, replace the existing code with this:
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  
  try {
    console.log('Processing task with data:', formData);
    
    let response;
    if (selectedTask) {
      // For updates, make sure we include the task ID
      const taskId = selectedTask.id || selectedTask.taskId;
      console.log('Updating task:', taskId, 'with data:', formData);
      
      // Use the createOrUpdateTask method which handles both cases
      response = await taskService.createOrUpdateTask({
        ...formData,
        id: taskId, // Include the ID in the data
        taskId: taskId // Include both ID formats to be safe
      });
    } else {
      // For new tasks, just pass the form data
      console.log('Creating new task with data:', formData);
      response = await taskService.createTask(formData);
    }
    
    console.log('Task processed successfully:', response);
    
    // Reset form and close dialog
    setFormData({
      projectId: '',
      workerId: '',
      description: '',
      status: 'Pending'
    });
    setOpen(false);
    setSelectedTask(null);
    
    // Refresh task list
    loadTasks();
    
    // Show success message
    toast.success(selectedTask ? 'Tarea actualizada con éxito' : 'Tarea creada con éxito');
  } catch (error) {
    console.error('Error al procesar la tarea:', error);
    console.error('Error details:', error.response?.data || error.message);
    toast.error(`Error: ${error.response?.data?.message || error.message}`);
  } finally {
    setLoading(false);
  }
};

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar esta tarea?')) {
      setLoading(true);
      try {
        console.log('Deleting task:', id);
        const response = await taskService.deleteTask(id);
        console.log('Delete task response:', response);
        toast.success('Tarea eliminada exitosamente');
        loadTasks(); // Recargar tareas
      } catch (error) {
        console.error('Error al eliminar la tarea:', error);
        console.error('Error details:', error.response?.data || error.message);
        toast.error('Error al eliminar la tarea');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBulkActionOpen = () => {
    if (selectedTasks.length === 0) {
      toast.warning('Seleccione al menos una tarea');
      return;
    }
    fetchAllWorkers();
    fetchAllProjects();
    setBulkActionOpen(true);
  };

  const handleBulkActionClose = () => {
    setBulkActionOpen(false);
  };

  const handleBulkActionSubmit = async () => {
    setLoading(true);
    try {
      if (bulkAction.action === 'status') {
        console.log('Bulk updating task status:', bulkAction.status, 'for tasks:', selectedTasks);
        const response = await taskService.bulkUpdateTaskStatus(selectedTasks, bulkAction.status);
        console.log('Bulk update status response:', response);
        toast.success(`Estado actualizado para ${selectedTasks.length} tareas`);
      } else if (bulkAction.action === 'assign') {
        console.log('Bulk assigning tasks to worker:', bulkAction.workerId, 'for tasks:', selectedTasks);
        const response = await taskService.bulkAssignTasks(selectedTasks, bulkAction.workerId);
        console.log('Bulk assign response:', response);
        toast.success(`${selectedTasks.length} tareas asignadas al trabajador ${bulkAction.workerId}`);
      }
      handleBulkActionClose();
      setSelectedTasks([]);
      loadTasks(); // Recargar tareas
    } catch (error) {
      console.error('Error al procesar acción en masa:', error);
      console.error('Error details:', error.response?.data || error.message);
      toast.error('Error al procesar la acción en masa');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskSelection = (taskId) => {
    setSelectedTasks(prev => {
      if (prev.includes(taskId)) {
        return prev.filter(id => id !== taskId);
      } else {
        return [...prev, taskId];
      }
    });
  };

  const handleSelectAllTasks = (event) => {
    if (event.target.checked) {
      setSelectedTasks(filteredTasks.map(task => task.id));
    } else {
      setSelectedTasks([]);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if (newValue === 1 && isAdmin) {
      loadTaskStats();
    }
  };

  const handleDateRangeSearch = async () => {
    if (!dateRangeFilter.startDate || !dateRangeFilter.endDate) {
      toast.warning('Por favor seleccione fechas de inicio y fin');
      return;
    }
    
    setLoading(true);
    try {
      console.log('Searching tasks by date range:', dateRangeFilter);
      const tasks = await taskService.getTasksByDateRange(
        dateRangeFilter.startDate,
        dateRangeFilter.endDate
      );
      console.log('Tasks by date range response:', tasks);
      setTasks(tasks);
      setFilteredTasks(tasks);
    } catch (error) {
      console.error('Error al buscar por rango de fechas:', error);
      console.error('Error details:', error.response?.data || error.message);
      toast.error('Error al buscar tareas por rango de fechas');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Completed':
        return <CheckCircleIcon fontSize="small" />;
      case 'In Progress':
        return <ScheduleIcon fontSize="small" />;
      default:
        return <PendingIcon fontSize="small" />;
    }
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'Completed':
        return 'task-status-completed';
      case 'In Progress':
        return 'task-status-progress';
      default:
        return 'task-status-pending';
    }
  };

  return (
    <div className="task-management-container">
      <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant="fullWidth"
            className="task-tabs"
            sx={{
              '& .MuiTab-root': {
                color: '#592d2d',
                '&:hover': {
                  color: '#000000',
                },
                '&.Mui-selected': {
                  color: '#000000',
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#000000',
              }
            }}
          >
            <Tab label="Gestión de Tareas" />
            {isAdmin && <Tab label="Estadísticas" />}
          </Tabs>

      {tabValue === 0 && (
        <>
          <div className="task-header">
            <Typography variant="h4" component="h1" sx={{ color: '#592d2d' }}>
              Gestión de Tareas
            </Typography>
            <div className="task-header-actions">
              {selectedTasks.length > 0 && isAdmin && (
                <Button
                  variant="outlined"
                  onClick={handleBulkActionOpen}
                  startIcon={<AssignmentIcon />}
                  sx={{ mr: 2 }}
                >
                  Acciones en Masa ({selectedTasks.length})
                </Button>
              )}
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpen()}
                sx={{ 
                  background: 'linear-gradient(45deg, #2c3e50 30%,rgb(0, 0, 0) 90%)',
                  boxShadow: '0 3px 5px 2px rgba(52, 152, 219, .3)'
                }}  
              >
                Nueva Tarea
              </Button>
            </div>
          </div>

          <div className="task-filters">
            <TextField
              placeholder="Buscar por descripción o nombre de proyecto..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ flexGrow: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            
            <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Estado</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Estado"
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="Pending">Pendientes</MenuItem>
                <MenuItem value="In Progress">En Progreso</MenuItem>
                <MenuItem value="Completed">Completadas</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Proyecto</InputLabel>
              <Select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                label="Proyecto"
              >
                <MenuItem value="">Todos</MenuItem>
                {filteredTasks
                  .reduce((uniqueProjects, task) => {
                    if (task.projectId && !uniqueProjects.some(p => p.id === task.projectId)) {
                      uniqueProjects.push({
                        id: task.projectId,
                        name: task.projectName || `Proyecto #${task.projectId}`
                      });
                    }
                    return uniqueProjects;
                  }, [])
                  .map(project => (
                    <MenuItem key={project.id} value={project.id}>
                      {project.name}
                    </MenuItem>
                  ))
                }
              </Select>
            </FormControl>
            
      
            
            <IconButton onClick={loadTasks} color="primary">
              <RefreshIcon />
            </IconButton>
          </div>

          

          {loading ? (
            <div className="loading-container">
              <CircularProgress />
            </div>
          ) : error ? (
            <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
          ) : (
            <div className="task-grid">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <div key={task.taskId || task.id} className="task-card">
  {isAdmin && (
    <Checkbox
      checked={selectedTasks.includes(task.taskId || task.id)}
      onChange={() => handleTaskSelection(task.taskId || task.id)}
      className="task-checkbox"
    />
  )}

  {/* Botón de eliminar posicionado en la esquina superior derecha */}
  <div className="delete-icon">
    <Tooltip title="Eliminar">
      <IconButton 
        size="small" 
        onClick={() => handleDelete(task.taskId || task.id)}
        sx={{
          color: '#d32f2f',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)' }
        }}
      >
        <DeleteIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  </div>

  <div className="task-card-header">
    <div>
      <Typography className="task-project-name">
        <AssignmentIcon className="task-project-icon" />
        {task.projectName || `Proyecto #${task.projectId}`}
      </Typography>
      <span className={`task-status-chip ${getStatusClass(task.status)}`}>
        {getStatusIcon(task.status)} {task.status}
      </span>
    </div>
    <div className="task-actions">
      <Tooltip title="Editar">
        <IconButton 
          size="small" 
          onClick={() => handleOpen(task)}
          sx={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)' }
          }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      {/* Eliminamos el botón de eliminar de aquí */}
    </div>
  </div>
  {/* Resto del contenido de la tarjeta */}
  <Typography className="task-card-description">
    {task.description}
  </Typography>
  <div className="task-card-footer">
    <div className="task-worker-info">
      <Avatar sx={{ width: 24, height: 24, bgcolor: '#000000' }}>
        {task.workerName ? task.workerName.charAt(0).toUpperCase() : <PersonIcon fontSize="small" />}
      </Avatar>
      <span>{task.workerName || `Trabajador #${task.workerId}`}</span>
      {task.workerEmail && (
        <Typography variant="caption" sx={{ ml: 1 }}>
          ({task.workerEmail})
        </Typography>
      )}
    </div>
    <div className="task-date">
      {new Date(task.createdAt).toLocaleDateString()}
    </div>
  </div>
</div>

                ))
              ) : (
                <Typography variant="body1" sx={{ gridColumn: '1 / -1', textAlign: 'center', py: 4 }}>
                  No se encontraron tareas con los filtros aplicados.
                </Typography>
              )}
            </div>
          )}
        </>
      )}
{/* Sección de Estadísticas */}
      {tabValue === 1 && isAdmin && (
        <div className="stats-container">
          <Typography variant="h5" sx={{ mb: 4, display: 'flex', alignItems: 'center', color: '#2c3e50', fontWeight: 600 }}>
            <BarChartIcon sx={{ mr: 1 }} /> Estadísticas de Tareas
          </Typography>
          
          {taskStats ? (
            <>
              {/* Cards principales */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper className="stats-card" elevation={3} sx={{ 
                    p: 3, 
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': { 
                      transform: 'translateY(-5px)',
                      boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                    }
                  }}>
                    <div className="stats-card-content">
                      <div className="stats-card-icon total">
                        <AssignmentIcon fontSize="large" />
                      </div>
                      <div>
                        <Typography variant="h3" sx={{ fontWeight: 700 }}>{taskStats.stats?.total || 0}</Typography>
                        <Typography variant="subtitle1" sx={{ color: '#64748b' }}>Tareas Totales</Typography>
                      </div>
                    </div>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Paper className="stats-card" elevation={3} sx={{ 
                    p: 3, 
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #e6fffa 0%, #b2f5ea 100%)',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': { 
                      transform: 'translateY(-5px)',
                      boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                    }
                  }}>
                    <div className="stats-card-content">
                      <div className="stats-card-icon completed">
                        <CheckCircleIcon fontSize="large" />
                      </div>
                      <div>
                        <Typography variant="h3" sx={{ fontWeight: 700 }}>{taskStats.stats?.completed || 0}</Typography>
                        <Typography variant="subtitle1" sx={{ color: '#64748b' }}>Completadas</Typography>
                      </div>
                    </div>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Paper className="stats-card" elevation={3} sx={{ 
                    p: 3, 
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #fff9e6 0%, #ffeeba 100%)',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': { 
                      transform: 'translateY(-5px)',
                      boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                    }
                  }}>
                    <div className="stats-card-content">
                      <div className="stats-card-icon in-progress">
                        <ScheduleIcon fontSize="large" />
                      </div>
                      <div>
                        <Typography variant="h3" sx={{ fontWeight: 700 }}>{taskStats.stats?.inProgress || 0}</Typography>
                        <Typography variant="subtitle1" sx={{ color: '#64748b' }}>En Progreso</Typography>
                      </div>
                    </div>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Paper className="stats-card" elevation={3} sx={{ 
                    p: 3, 
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #ffe6e6 0%, #ffcccc 100%)',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': { 
                      transform: 'translateY(-5px)',
                      boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                    }
                  }}>
                    <div className="stats-card-content">
                      <div className="stats-card-icon pending">
                        <PendingIcon fontSize="large" />
                      </div>
                      <div>
                        <Typography variant="h3" sx={{ fontWeight: 700 }}>{taskStats.stats?.pending || 0}</Typography>
                        <Typography variant="subtitle1" sx={{ color: '#64748b' }}>Pendientes</Typography>
                      </div>
                    </div>
                  </Paper>
                </Grid>
              </Grid>
              
              {/* Gráficos y detalles */}
              <Grid container spacing={3}>
                {/* Distribución de tareas */}
                <Grid item xs={12} md={6}>
                  <Paper className="stats-detail-card" elevation={3} sx={{ 
                    p: 3, 
                    borderRadius: '12px',
                    height: '100%',
                    background: 'white'
                  }}>
                    <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', fontWeight: 600 }}>
                      <BarChartIcon sx={{ mr: 1, color: '#3498db' }} /> Distribución de Tareas
                    </Typography>
                    
                    <div className="stats-progress-container">
                      <div className="stats-progress-item">
                        <div className="stats-progress-label">
                          <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                            <span className="status-dot completed"></span>
                            Completadas
                          </Typography>
                          <Typography sx={{ fontWeight: 600 }}>
                            {Math.round((taskStats.stats?.completed / taskStats.stats?.total || 0) * 100)}%
                          </Typography>
                        </div>
                        <div className="stats-progress-bar-container">
                          <div 
                            className="stats-progress-bar completed" 
                            style={{ width: `${(taskStats.stats?.completed / taskStats.stats?.total || 0) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="stats-progress-item">
                        <div className="stats-progress-label">
                          <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                            <span className="status-dot in-progress"></span>
                            En Progreso
                          </Typography>
                          <Typography sx={{ fontWeight: 600 }}>
                            {Math.round((taskStats.stats?.inProgress / taskStats.stats?.total || 0) * 100)}%
                          </Typography>
                        </div>
                        <div className="stats-progress-bar-container">
                          <div 
                            className="stats-progress-bar in-progress" 
                            style={{ width: `${(taskStats.stats?.inProgress / taskStats.stats?.total || 0) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="stats-progress-item">
                        <div className="stats-progress-label">
                          <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                            <span className="status-dot pending"></span>
                            Pendientes
                          </Typography>
                          <Typography sx={{ fontWeight: 600 }}>
                            {Math.round((taskStats.stats?.pending / taskStats.stats?.total || 0) * 100)}%
                          </Typography>
                        </div>
                        <div className="stats-progress-bar-container">
                          <div 
                            className="stats-progress-bar pending" 
                            style={{ width: `${(taskStats.stats?.pending / taskStats.stats?.total || 0) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </Paper>
                </Grid>
                
                {/* Resumen del proyecto */}
                <Grid item xs={12} md={6}>
                  <Paper className="stats-detail-card" elevation={3} sx={{ 
                    p: 3, 
                    borderRadius: '12px',
                    height: '100%',
                    background: 'white'
                  }}>
                    <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', fontWeight: 600 }}>
                      <PersonIcon sx={{ mr: 1, color: '#9c27b0' }} /> Resumen de tareas
                    </Typography>
                    
                    <div className="stats-info-grid">
                    <div className="stats-info-item">
                        <div className="stats-info-icon efficiency">
                          <CheckCircleIcon />
                        </div>
                        <div className="stats-info-content">
                          <Typography variant="h4" sx={{ fontWeight: 700 }}>
                            {taskStats.stats?.total ? Math.round((taskStats.stats?.completed / taskStats.stats?.total) * 100) : 0}%
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#64748b' }}>
                            Tasa de Finalización
                          </Typography>
                        </div>
                      </div>
                      
                      
                      
                      
                    </div>
                  </Paper>
                </Grid>
              </Grid>
            </>
          ) : (
            <div className="loading-container">
              <CircularProgress />
            </div>
          )}
        </div>
      )}

      {/* Diálogo para crear/editar tarea */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedTask ? 'Editar Tarea' : 'Nueva Tarea'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
          <FormControl fullWidth margin="normal" required>
  <InputLabel>Proyecto</InputLabel>
  <Select
    value={formData.projectId}
    onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
    label="Proyecto"
  >
    {allProjects.length > 0 ? (
      allProjects.map(project => (
        <MenuItem key={project.projectId} value={project.projectId}>
          {project.projectName}
        </MenuItem>
      ))
    ) : (
      // Fallback to filtered tasks if allProjects is empty
      filteredTasks
        .reduce((uniqueProjects, task) => {
          if (task.projectId && !uniqueProjects.some(p => p.id === task.projectId)) {
            uniqueProjects.push({
              id: task.projectId,
              name: task.projectName || `Proyecto #${task.projectId}`
            });
          }
          return uniqueProjects;
        }, [])
        .map(project => (
          <MenuItem key={project.id} value={project.id}>
            {project.name}
          </MenuItem>
        ))
    )}
  </Select>
</FormControl>
            <FormControl fullWidth margin="normal" required>
  <InputLabel>Trabajador</InputLabel>
  <Select
    value={formData.workerId}
    onChange={(e) => setFormData({ ...formData, workerId: e.target.value })}
    label="Trabajador"
  >
    {allWorkers.length > 0 ? (
      allWorkers.map(worker => (
        <MenuItem key={worker.userId} value={worker.userId}>
          {worker.name} ({worker.email})
        </MenuItem>
      ))
    ) : (
      // Fallback to filtered tasks if allWorkers is empty
      filteredTasks
        .reduce((uniqueWorkers, task) => {
          if (task.workerId && !uniqueWorkers.some(w => w.id === task.workerId)) {
            uniqueWorkers.push({
              id: task.workerId,
              name: task.workerName || `Trabajador #${task.workerId}`
            });
          }
          return uniqueWorkers;
        }, [])
        .map(worker => (
          <MenuItem key={worker.id} value={worker.id}>
            {worker.name}
          </MenuItem>
        ))
    )}
  </Select>
</FormControl>
            <TextField
              fullWidth
              label="Descripción"
              multiline
              rows={4}
              margin="normal"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Estado</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                label="Estado"
              >
                <MenuItem value="Pending">Pendiente</MenuItem>
                <MenuItem value="In Progress">En Progreso</MenuItem>
                <MenuItem value="Completed">Completada</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="inherit">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : selectedTask ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Diálogo para acciones en masa */}
      <Dialog open={bulkActionOpen} onClose={handleBulkActionClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Acciones en Masa ({selectedTasks.length} tareas seleccionadas)
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Acción</InputLabel>
            <Select
              value={bulkAction.action}
              onChange={(e) => setBulkAction({ ...bulkAction, action: e.target.value })}
              label="Acción"
            >
              <MenuItem value="status">Cambiar Estado</MenuItem>
              <MenuItem value="assign">Asignar a Trabajador</MenuItem>
            </Select>
          </FormControl>

          {bulkAction.action === 'status' && (
            <FormControl fullWidth margin="normal">
              <InputLabel>Nuevo Estado</InputLabel>
              <Select
                value={bulkAction.status}
                onChange={(e) => setBulkAction({ ...bulkAction, status: e.target.value })}
                label="Nuevo Estado"
              >
                <MenuItem value="Pending">Pendiente</MenuItem>
                <MenuItem value="In Progress">En Progreso</MenuItem>
                <MenuItem value="Completed">Completada</MenuItem>
              </Select>
            </FormControl>
          )}

          {bulkAction.action === 'assign' && (
            <FormControl fullWidth margin="normal">
              <InputLabel>Trabajador</InputLabel>
              <Select
                value={bulkAction.workerId}
                onChange={(e) => setBulkAction({ ...bulkAction, workerId: e.target.value })}
                label="Trabajador"
              >
                {allWorkers.length > 0 ? (
                  allWorkers.map(worker => (
                    <MenuItem key={worker.userId} value={worker.userId}>
                      {worker.name} ({worker.email})
                    </MenuItem>
                  ))
                ) : (
                  // Fallback to filtered tasks if allWorkers is empty
                  filteredTasks
                    .reduce((uniqueWorkers, task) => {
                      if (task.workerId && !uniqueWorkers.some(w => w.id === task.workerId)) {
                        uniqueWorkers.push({
                          id: task.workerId,
                          name: task.workerName || `Trabajador #${task.workerId}`
                        });
                      }
                      return uniqueWorkers;
                    }, [])
                    .map(worker => (
                      <MenuItem key={worker.id} value={worker.id}>
                        {worker.name}
                      </MenuItem>
                    ))
                )}
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleBulkActionClose} color="inherit">
            Cancelar
          </Button>
          <Button 
            onClick={handleBulkActionSubmit} 
            
            color="white"
            disabled={loading || (bulkAction.action === 'assign' && !bulkAction.workerId)}
          >
            {loading ? <CircularProgress size={24} /> : 'Aplicar'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TaskManagement;
