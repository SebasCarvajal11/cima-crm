// Importar el servicio de cliente al principio del archivo
const projectModel = require('./project-model');
const clientService = require('../client/client-service');

// Obtener estadísticas
exports.getProjectStats = async () => {
    try {
        return await projectModel.getProjectStats();
    } catch (error) {
        throw new Error('Error al obtener estadísticas: ' + error.message);
    }
};

// Obtener todos los proyectos
exports.getAllProjects = async (filters) => {
    try {
        return await projectModel.getAllProjects(filters);
    } catch (error) {
        throw new Error('Error al obtener proyectos: ' + error.message);
    }
};

// Obtener proyecto por ID
exports.getProjectById = async (projectId) => {
    try {
        return await projectModel.getProjectById(projectId);
    } catch (error) {
        throw new Error('Error al obtener el proyecto: ' + error.message);
    }
};

// Crear proyecto
exports.createProject = async (projectData) => {
    try {
        // Verificar si el cliente existe antes de crear el proyecto
        const clientId = projectData.clientId;
        try {
            const client = await clientService.getClientById(clientId);
            if (!client) {
                throw new Error(`El cliente con ID ${clientId} no existe`);
            }
        } catch (error) {
            throw new Error(`Error al verificar el cliente: ${error.message}`);
        }
        
        // Si llegamos aquí, el cliente existe, continuamos con la creación del proyecto
        return await projectModel.saveProject(projectData);
    } catch (error) {
        throw new Error('Error al crear el proyecto: ' + error.message);
    }
};

// Actualizar proyecto
exports.updateProject = async (projectId, updateData) => {
    try {
        // Verificar si el cliente existe antes de actualizar el proyecto
        if (updateData.clientId) {
            try {
                const client = await clientService.getClientById(updateData.clientId);
                if (!client) {
                    throw new Error(`El cliente con ID ${updateData.clientId} no existe`);
                }
            } catch (error) {
                throw new Error(`Error al verificar el cliente: ${error.message}`);
            }
        }
        
        // Si llegamos aquí, el cliente existe o no se está actualizando el clientId
        return await projectModel.updateProject(projectId, updateData);
    } catch (error) {
        throw new Error('Error al actualizar el proyecto: ' + error.message);
    }
};

// Eliminar proyecto
exports.deleteProject = async (projectId) => {
    try {
        return await projectModel.deleteProject(projectId);
    } catch (error) {
        throw new Error('Error al eliminar el proyecto: ' + error.message);
    }
};

// Obtener proyectos por cliente
exports.getProjectsByClientId = async (clientId) => {
    try {
        return await projectModel.getProjectsByClientId(clientId);
    } catch (error) {
        throw new Error('Error al obtener proyectos del cliente: ' + error.message);
    }
};
// NUEVA FUNCIÓN: Obtener todos los clientes actuales
exports.getAllClients = async () => {
    try {
        return await projectModel.getAllClients();
    } catch (error) {
        throw new Error('Error al obtener clientes: ' + error.message);
    }
};
// Obtener el progreso de un proyecto
exports.getProjectProgress = async (projectId) => {
    try {
        return await projectModel.getProjectProgress(projectId);
    } catch (error) {
        throw new Error('Error al obtener el progreso del proyecto: ' + error.message);
    }
};

// Get projects by worker ID
exports.getWorkerProjects = async (workerId) => {
    try {
        if (!workerId) {
            throw new Error('Worker ID is required');
        }
        return await projectModel.getWorkerProjects(workerId);
    } catch (error) {
        throw new Error('Error getting worker projects: ' + error.message);
    }
};

// Obtener tareas del trabajador en un proyecto específico
exports.getWorkerProjectTasks = async (projectId, workerId) => {
    try {
        return await projectModel.getWorkerProjectTasks(projectId, workerId);
    } catch (error) {
        throw new Error('Error al obtener las tareas del trabajador: ' + error.message);
    }
};

exports.getClientProjects = async (userId) => {
    try {
        const projects = await projectModel.getClientProjects(userId);
        
        // Enriquecemos cada proyecto con información adicional
        const enrichedProjects = await Promise.all(projects.map(async (project) => {
            const progress = await projectModel.getProjectProgress(project.projectId);
            return {
                ...project,
                progress: progress.progress || 0,
                taskStats: {
                    total: progress.totalTasks || 0,
                    completed: progress.completedTasks || 0,
                    inProgress: progress.inProgressTasks || 0,
                    pending: progress.pendingTasks || 0
                }
            };
        }));

        return enrichedProjects;
    } catch (error) {
        throw new Error('Error al obtener los proyectos del cliente: ' + error.message);
    }
};

exports.updateTaskStatus = async (taskId, workerId, newStatus) => {
    try {
        // Validate status
        const validStatuses = ['Pending', 'In Progress', 'Completed'];
        if (!validStatuses.includes(newStatus)) {
            throw new Error('Estado no válido. Use: Pending, In Progress, o Completed');
        }

        // Update task status
        const result = await projectModel.updateTaskStatus(taskId, workerId, newStatus);
        
        if (!result) {
            throw new Error('No se pudo actualizar el estado de la tarea');
        }

        return {
            success: true,
            message: 'Estado de la tarea actualizado correctamente',
            data: result
        };
    } catch (error) {
        throw new Error('Error en el servicio de actualización de tarea: ' + error.message);
    }
};

module.exports = exports;