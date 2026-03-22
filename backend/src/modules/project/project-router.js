const express = require('express');
const router = express.Router();
const projectService = require('./project-service');
const { auth } = require('../../util/router-util');

 // Rutas específicas primero
 router.get('/my-projects', auth, async (req, res) => {
    try {
        const userId = req.activeUserId;
        console.log('🔍 /my-projects - Usuario ID:', userId);
        
        if (!userId) {
            console.log('❌ /my-projects - Usuario no autenticado');
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado o token inválido'
            });
        }

        console.log('📤 Llamando a getClientProjects con userId:', userId);
        const projects = await projectService.getClientProjects(userId);
        console.log('📥 Respuesta de getClientProjects:', JSON.stringify(projects, null, 2));

        res.json({
            success: true,
            projects,
            count: projects?.length || 0
        });
    } catch (error) {
        console.error('❌ Error en /my-projects:', {
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({
            success: false,
            message: 'Error al obtener los proyectos del cliente',
            error: error.message
        });
    }
}); 
// Añadir esta nueva ruta
router.get('/worker/projects', auth, async (req, res) => {
    try {
        const workerId = req.activeUserId;
        
        if (!workerId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated or invalid token'
            });
        }

        const projects = await projectService.getWorkerProjects(workerId);
        res.json({
            success: true,
            projects,
            count: projects.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error getting worker projects',
            error: error.message
        });
    }
});
const yup = require('yup');

    // Schema de validación
    const projectSchema = yup.object().shape({
        clientId: yup.number().required('El ID del cliente es requerido'),
        projectName: yup.string().required('El nombre del proyecto es requerido'),
        description: yup.string().nullable(),
        status: yup.string()
            .oneOf(['Pending', 'In Progress', 'Completed'], 'Estado no válido')
            .default('Pending')
    });

    // 1. Obtener estadísticas
    router.get('/stats', auth, async (req, res) => {
        try {
            const stats = await projectService.getProjectStats();
            res.json({
                success: true,
                stats
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener estadísticas',
                error: error.message
            });
        }
    });
    // NUEVA RUTA: Obtener todos los clientes actuales
    router.get('/clients', async (req, res) => {
        try {
            const clients = await projectService.getAllClients();
            res.json({
                success: true,
                count: clients.length,
                clients
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener clientes',
                error: error.message
            });
        }
    });
    // 2. Obtener proyectos por cliente
    router.get('/client/:clientId', auth, async (req, res) => {
        try {
            const projects = await projectService.getProjectsByClientId(req.params.clientId);
            res.json({
                success: true,
                count: projects.length,
                projects
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener proyectos del cliente',
                error: error.message
            });
        }
    });

    // 3. Obtener todos los proyectos
    router.get('/', auth, async (req, res) => {
        try {
            const { status, clientId, search } = req.query;
            const filters = {};
            
            if (status) filters.status = status;
            if (clientId) filters.clientId = parseInt(clientId);
            if (search) filters.search = search;

            const projects = await projectService.getAllProjects(filters);
            res.json({
                success: true,
                count: projects.length,
                projects
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener proyectos',
                error: error.message
            });
        }
    });

    // 4. Obtener proyecto por ID
    router.get('/:id', auth, async (req, res) => {
        try {
            const project = await projectService.getProjectById(req.params.id);
            res.json({
                success: true,
                project
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: 'Error al obtener el proyecto',
                error: error.message
            });
        }
    });

    // 5. Crear proyecto
    router.post('/', auth, async (req, res) => {
        try {
            const validatedData = await projectSchema.validate(req.body);
            const project = await projectService.createProject(validatedData);
            res.status(201).json({
                success: true,
                message: 'Proyecto creado exitosamente',
                project
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: 'Error al crear el proyecto',
                error: error.message
            });
        }
    });

    // 6. Actualizar proyecto
    router.put('/:id', auth, async (req, res) => {
        try {
            const validatedData = await projectSchema.validate(req.body);
            const project = await projectService.updateProject(req.params.id, validatedData);
            res.json({
                success: true,
                message: 'Proyecto actualizado exitosamente',
                project
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: 'Error al actualizar el proyecto',
                error: error.message
            });
        }
    });
    

    // 7. Actualizar estado
    router.patch('/:id/status', auth, async (req, res) => {
        try {
            const { status } = req.body;
            if (!['Pending', 'In Progress', 'Completed'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Estado no válido'
                });
            }
            const project = await projectService.updateProject(req.params.id, { status });
            res.json({
                success: true,
                message: 'Estado actualizado exitosamente',
                project
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: 'Error al actualizar el estado',
                error: error.message
            });
        }
    });
    
    // 8. Eliminar proyecto
    router.delete('/:id', auth, async (req, res) => {
        try {
            await projectService.deleteProject(req.params.id);
            res.json({
                success: true,
                message: 'Proyecto eliminado exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al eliminar el proyecto',
                error: error.message
            });
        }
        
    });

    router.get('/:id/progress', auth, async (req, res) => {
        try {
            const projectId = req.params.id;
            
            // Add timeout handling
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Query timeout')), 25000);
            });
            
            const progressPromise = projectService.getProjectProgress(projectId);
            
            // Race between the actual query and the timeout
            const progress = await Promise.race([progressPromise, timeoutPromise]);
            
            // Simplified response structure
            res.status(200).json({
                success: true,
                projectId,
                projectName: progress.projectName,
                progress: progress.progress || 0,
                taskStats: {
                    total: progress.totalTasks || 0,
                    completed: progress.completedTasks || 0,
                    inProgress: progress.inProgressTasks || 0,
                    pending: progress.pendingTasks || 0
                },
                // Only include essential task information
                tasks: (progress.taskStatus || []).map(task => ({
                    task_id: task.task_id,
                    status: task.status
                }))
            });
        } catch (error) {
            res.status(error.message === 'Query timeout' ? 504 : 500).json({
                success: false,
                message: error.message === 'Query timeout' 
                    ? 'La solicitud tardó demasiado tiempo en responder' 
                    : 'Error al obtener el progreso del proyecto',
                error: error.message
            });
        }
    });

    // Update task status
    router.put('/tasks/:taskId/status', auth, async (req, res) => {
        try {
            const taskId = parseInt(req.params.taskId);
            const workerId = req.activeUserId;
            const { status } = req.body;
            
            console.log('Solicitud de actualización:', {
                taskId,
                workerId,
                status,
                body: req.body
            });
    
            if (!status) {
                return res.status(400).json({
                    success: false,
                    message: 'El estado es requerido'
                });
            }

            if (!['Pending', 'In Progress', 'Completed'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Estado no válido. Debe ser: Pending, In Progress, o Completed'
                });
            }
    
            // Intentar actualizar directamente
            const result = await projectService.updateTaskStatus(taskId, workerId, status);
            console.log('Resultado de actualización:', result);
            
            res.json(result);
        } catch (error) {
            console.error('Error en actualización:', {
                error: error.message,
                taskId: req.params.taskId,
                workerId: req.activeUserId
            });
            
            const errorMessage = error.message.includes('no autorizada') 
                ? 'No estás autorizado para modificar esta tarea'
                : error.message;
            
            res.status(400).json({
                success: false,
                message: errorMessage
            });
        }
    });
    
    // Obtener tareas del trabajador en un proyecto específico
    router.get('/:projectId/worker/tasks', auth, async (req, res) => {
        try {
            const workerId = req.activeUserId;
            const projectId = parseInt(req.params.projectId);
    
            if (!workerId) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado o token inválido'
                });
            }
    
            // Obtener las tareas del trabajador para el proyecto específico
            const tasks = await projectService.getWorkerProjectTasks(projectId, workerId);
            
            res.json({
                success: true,
                projectId,
                workerId,
                tasks,
                count: tasks.length
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener las tareas del trabajador para el proyecto',
                error: error.message
            });
        }
    });
   

    module.exports = router;  // Asegúrate que esta línea esté al final