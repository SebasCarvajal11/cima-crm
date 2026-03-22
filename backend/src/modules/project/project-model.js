const { getQuery, update, remove, save, type, findQuery } = require('../../core/model');

// Definir la entidad del proyecto
// En project-model.js (usar type.optional para campos auto-generados)
exports.projectEntity = {
    projectId: type.number,
    clientId: type.number,
    projectName: type.string,
    description: type.string,
    status: type.enum(['Pending', 'In Progress', 'Completed']),
    createdAt: type.date,
    updatedAt: type.date
};

// Obtener estadísticas
exports.getProjectStats = async () => {
    try {
        const query = `
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as inprogress
            FROM PROJECTS
        `;
        
        // Let's log the raw results to debug
        const results = await findQuery(query, [], null);
        console.log('Raw project stats query results:', JSON.stringify(results, null, 2));
        
        const [result] = results;
        
        // Add a query to check actual status values in the database
        const statusCheck = await findQuery(
            'SELECT DISTINCT status FROM PROJECTS',
            [],
            null
        );
        console.log('Actual status values in database:', JSON.stringify(statusCheck, null, 2));
        
        return {
            total: parseInt(result?.total || 0),
            completed: parseInt(result?.completed || 0),
            pending: parseInt(result?.pending || 0),
            inProgress: parseInt(result?.inprogress || 0) // Changed from inProgress to inprogress to match DB result
        };
    } catch (error) {
        console.error('Error en getProjectStats:', error);
        throw new Error('Error al obtener estadísticas: ' + error.message);
    }
};

exports.getAllProjects = async (filters = {}) => {
    try {
        let query = `
            SELECT 
                p.*,
                c.client_id,
                c.contact_info,
                u.name as client_name,
                u.email as client_email
            FROM PROJECTS p
            LEFT JOIN CLIENTS c ON p.client_id = c.client_id
            LEFT JOIN USERS u ON c.user_id = u.user_id
        `;
        
        const params = [];
        const conditions = [];

        if (filters.status) {
            conditions.push('p.status = ?');
            params.push(filters.status);
        }
        if (filters.clientId) {
            conditions.push('p.client_id = ?');
            params.push(filters.clientId);
        }
        if (filters.search) {
            conditions.push('(p.project_name LIKE ? OR p.description LIKE ? OR u.name LIKE ?)');
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY p.created_at DESC';
        
        console.log('Query being executed:', query);
        console.log('Query parameters:', params);
        
        const projects = await findQuery(query, params, null);
        
        console.log('Raw query results:', JSON.stringify(projects, null, 2));
        
        return projects.map(project => ({
            projectId: project.projectId,
            clientId: project.clientId,
            projectName: project.projectName,
            description: project.description,
            status: project.status,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
            client: {
                clientId: project.clientId,
                name: project.clientName || 'Sin nombre',
                email: project.clientEmail || 'Sin email',
                contactInfo: project.contactInfo || 'Sin información'
            }
        })) || [];
        
    } catch (error) {
        console.error('Error en getAllProjects:', error);
        throw new Error('Error al obtener los proyectos: ' + error.message);
    }
};

// Obtener proyecto por ID
exports.getProjectById = async (projectId) => {
    try {
        const query = 'SELECT * FROM PROJECTS WHERE project_id = ?';
        const [project] = await findQuery(query, [projectId], exports.projectEntity);
        if (!project) {
            throw new Error('Proyecto no encontrado');
        }
        return project;
    } catch (error) {
        throw new Error('Error al obtener el proyecto: ' + error.message);
    }
};

// Guardar proyecto
exports.saveProject = async (projectData) => {
    try {
        const dataToSave = {
            ...projectData,
            status: projectData.status || 'Pending',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await save('PROJECTS', dataToSave, null, exports.projectEntity);
        if (!result) throw new Error('Error al guardar el proyecto');
        return result;
    } catch (error) {
        throw new Error('Error al guardar el proyecto: ' + error.message);
    }
};

// Actualizar proyecto
exports.updateProject = async (projectId, updatedData) => {
    const whereObj = { projectId }; // Asegúrate de que el campo coincida con tu esquema
    try {
        const result = await update('PROJECTS', updatedData, whereObj, exports.projectEntity);
        return result; // Devuelve el resultado de la actualización
    } catch (error) {
        console.error("Error al actualizar el proyecto:", error);
        throw new Error('Error al actualizar el proyecto: ' + error.message);
    }
};

// Eliminar proyecto
exports.deleteProject = async (projectId) => {
    try {
        const result = await remove('PROJECTS', { projectId }, exports.projectEntity);
        if (!result) throw new Error('Error al eliminar el proyecto');
        return true;
    } catch (error) {
        throw new Error('Error al eliminar el proyecto: ' + error.message);
    }
};

// Obtener proyectos por cliente
exports.getProjectsByClientId = async (clientId) => {
    try {
        const query = `
            SELECT 
                p.*,
                c.client_id,
                c.contact_info,
                u.name as client_name,
                u.email as client_email
            FROM PROJECTS p
            LEFT JOIN CLIENTS c ON p.client_id = c.client_id
            LEFT JOIN USERS u ON c.user_id = u.user_id
            WHERE p.client_id = ?
            ORDER BY p.created_at DESC`;

        const projects = await findQuery(query, [clientId], null);
        
        return projects.map(project => ({
            projectId: project.project_id,
            clientId: project.client_id,
            projectName: project.project_name,
            description: project.description,
            status: project.status,
            createdAt: project.created_at,
            updatedAt: project.updated_at,
            client: project.client_id ? {
                clientId: project.client_id,
                name: project.client_name || 'Sin nombre',
                email: project.client_email || 'Sin email',
                contactInfo: project.contact_info || 'Sin información'
            } : null
        })) || [];
    } catch (error) {
        throw new Error('Error al obtener proyectos del cliente: ' + error.message);
    }
};

// Calcular el progreso de un proyecto basado en sus tareas
exports.getProjectProgress = async (projectId) => {
    try {
        if (!projectId) {
            throw new Error('Project ID is required');
        }

        // Obtener información del proyecto
        const projectQuery = `
            SELECT project_name as projectname
            FROM PROJECTS
            WHERE project_id = ?
        `;
        
        const [projectInfo] = await findQuery(projectQuery, [projectId], null);
        
        if (!projectInfo) {
            throw new Error('Project not found');
        }

        console.log('Project info:', projectInfo); // Añadir este log para depuración
        
        // Obtener todas las tareas del proyecto con conteo por estado
        const query = `
            SELECT 
                COUNT(*) as totalTasks,
                SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completedTasks,
                SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as inProgressTasks,
                SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pendingTasks
            FROM TASKS
            WHERE project_id = ?
        `;
        
        const [result] = await findQuery(query, [projectId], null);
        console.log('Task stats result:', result); // Debug log
        
        // Calcular el porcentaje de progreso - asegurarse de que los valores sean números
        const totalTasks = parseInt(result.totaltasks || 0);
        const completedTasks = parseInt(result.completedtasks || 0);
        const inProgressTasks = parseInt(result.inprogresstasks || 0);
        const pendingTasks = parseInt(result.pendingtasks || 0);
        
        console.log('Parsed values:', { totalTasks, completedTasks, inProgressTasks, pendingTasks });
        
        // Si no hay tareas, el progreso es 0%
        if (totalTasks === 0) {
            return {
                progress: 0,
                projectName: projectInfo.projectname, // Cambiado a projectname en minúsculas
                totalTasks: 0,
                completedTasks: 0,
                inProgressTasks: 0,
                pendingTasks: 0,
                taskStatus: []
            };
        }
        
        // Fórmula para calcular el progreso:
        // (Tareas completadas * 100 + Tareas en progreso * 50) / (Total de tareas * 100)
        const progress = Math.round(
            ((completedTasks * 100 + inProgressTasks * 50) / (totalTasks * 100)) * 100
        );
        
        console.log('Calculated progress:', progress);
        
        // Obtener detalles de las tareas para mostrar en la lista de verificación
        const tasksQuery = `
            SELECT 
                t.task_id, 
                t.description, 
                t.status, 
                t.created_at,
                u.name as worker_name
            FROM TASKS t
            LEFT JOIN USERS u ON t.worker_id = u.user_id
            WHERE t.project_id = ?
            ORDER BY 
                CASE 
                    WHEN t.status = 'Completed' THEN 1
                    WHEN t.status = 'In Progress' THEN 2
                    WHEN t.status = 'Pending' THEN 3
                END,
                t.created_at DESC
        `;
        
        const taskStatus = await findQuery(tasksQuery, [projectId], null);
        
        return {
            progress,
            projectName: projectInfo.projectname, // Cambiado a projectname en minúsculas
            totalTasks,
            completedTasks,
            inProgressTasks,
            pendingTasks,
            taskStatus: taskStatus || []
        };
    } catch (error) {
        console.error('Error en getProjectProgress:', error);
        throw new Error('Error al calcular el progreso del proyecto: ' + error.message);
    }
};


// NUEVA FUNCIÓN: Obtener todos los clientes actuales
exports.getAllClients = async () => {
    try {
        const query = 'SELECT * FROM CLIENTS ORDER BY client_id ASC';
        const clients = await findQuery(query, [], null);
        return clients || [];
    } catch (error) {
        throw new Error('Error al obtener clientes: ' + error.message);
    }
};

exports.getClientProjects = async (userId) => {
    try {
        const query = `
            SELECT 
                p.*,
                c.client_id,
                c.contact_info,
                u.name as client_name,
                u.email as client_email
            FROM PROJECTS p
            JOIN CLIENTS c ON p.client_id = c.client_id
            JOIN USERS u ON c.user_id = u.user_id
            WHERE u.user_id = ?
            ORDER BY p.created_at DESC
        `;
        
        const projects = await findQuery(query, [userId], null);
        console.log('Raw query results:', JSON.stringify(projects, null, 2));
        
        // Map projects directly without calculating progress
        return projects.map(project => ({
            projectId: project.projectId,
            clientId: project.clientId,
            projectName: project.projectName,
            description: project.description,
            status: project.status,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
            progress: 0, // Set default progress
            client: {
                clientId: project.clientId,
                name: project.clientName,
                email: project.clientEmail,
                contactInfo: project.contactInfo
            }
        })) || [];
        
    } catch (error) {
        console.error('Error en getClientProjects:', error);
        throw new Error('Error al obtener los proyectos del cliente: ' + error.message);
    }
};

exports.getWorkerProjects = async (workerId) => {
    try {
        console.log('Worker ID received:', workerId);
        
        const query = `
            SELECT DISTINCT
                p.project_id,
                p.client_id,
                p.project_name,
                p.description,
                p.status,
                p.created_at,
                p.updated_at,
                c.client_id,
                c.contact_info,
                u.name as client_name,
                u.email as client_email
            FROM PROJECTS p
            LEFT JOIN CLIENTS c ON p.client_id = c.client_id
            LEFT JOIN USERS u ON c.user_id = u.user_id
            INNER JOIN TASKS t ON p.project_id = t.project_id
            WHERE t.worker_id = ?
            ORDER BY p.created_at DESC
        `;
        
        console.log('Query being executed:', query);
        console.log('Parameters:', [workerId]);
        
        const projects = await findQuery(query, [workerId], null);
        
        console.log('Raw database results:', JSON.stringify(projects, null, 2));
        
        const mappedProjects = projects.map(project => ({
            projectId: project.projectId,
            clientId: project.clientId,
            projectName: project.projectName,
            description: project.description,
            status: project.status,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
            client: {
                clientId: project.clientId,
                name: project.clientName,
                email: project.clientEmail,
                contactInfo: project.contactInfo
            }
        }));

        console.log('Mapped results:', JSON.stringify(mappedProjects, null, 2));
        
        return mappedProjects || [];
        
    } catch (error) {
        console.error('Error in getWorkerProjects:', error);
        throw error;
    }
};

exports.getWorkerProjectTasks = async (projectId, workerId) => {
    try {
        const query = `
            SELECT 
                t.*,
                p.project_name,
                p.status as project_status,
                u.name as worker_name
            FROM TASKS t
            JOIN PROJECTS p ON t.project_id = p.project_id
            LEFT JOIN USERS u ON t.worker_id = u.user_id
            WHERE t.project_id = ? 
            AND t.worker_id = ?
            ORDER BY t.created_at DESC
        `;
        
        return await findQuery(query, [projectId, workerId], {
            ...exports.taskEntity,
            projectName: type.string,
            projectStatus: type.string,
            workerName: type.string
        });
    } catch (error) {
        console.error('Error en getWorkerProjectTasks:', error);
        throw new Error('Error al obtener las tareas del trabajador: ' + error.message);
    }
};

// Actualizar estado de tarea
exports.updateTaskStatus = async (taskId, workerId, newStatus) => {
    try {
        // Verificar que la tarea pertenece al trabajador
        const verifyQuery = `
            SELECT task_id FROM TASKS 
            WHERE task_id = ? AND worker_id = ?
        `;
        const [task] = await findQuery(verifyQuery, [taskId, workerId], null);
        
        if (!task) {
            throw new Error('Tarea no encontrada o no autorizada');
        }

        const updateData = {
            status: newStatus,
            updatedAt: new Date()
        };

        const result = await update('TASKS', updateData, { taskId }, null);
        return result;

    } catch (error) {
        console.error('Error in updateTaskStatus:', error);
        throw new Error('Error al actualizar el estado de la tarea: ' + error.message);
    }
};
module.exports = exports;