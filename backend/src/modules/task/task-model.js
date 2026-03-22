// modules/task/task-model.js
const { getQuery, update, remove, insert, type, findQuery } = require('../../core/model');

exports.taskEntity = {
    taskId: type.number,
    projectId: type.number,
    workerId: type.number,
    description: type.string,
    status: type.string, // Valores esperados: 'Pending', 'In Progress', 'Completed'
    createdAt: type.date,
    updatedAt: type.date
};

module.exports.createTask = async (task) => {
    if (!task.projectId) {
        throw new Error("Project ID is required");
    }
    if (!task.description) {
        throw new Error("Task description cannot be empty");
    }
    const dataObj = {
        projectId: task.projectId,
        workerId: task.workerId || null,
        description: task.description,
        status: task.status || 'Pending'
    };
    try {
        const insertId = await insert('TASKS', dataObj, this.taskEntity);
        return { ...dataObj, taskId: insertId };
    } catch (error) {
        throw new Error('Error creating task: ' + error.message);
    }
};

module.exports.updateTask = async (taskId, updatedData) => {
    try {
        if (!taskId) {
            throw new Error('El ID de la tarea es obligatorio para la actualización');
        }
        if (!updatedData || Object.keys(updatedData).length === 0) {
            throw new Error('No se proporcionaron datos para actualizar');
        }
        
        // Verify task exists before attempting update
        const existingTask = await this.getTaskById(taskId).catch(() => null);
        if (!existingTask) {
            throw new Error('La tarea con el ID especificado no existe');
        }
        
        console.log('TaskID:', taskId, 'Tipo:', typeof taskId);
        console.log('Datos a actualizar:', updatedData);
        
        const taskIdNum = Number(taskId);
        
        // Build the SET clause dynamically
        const setClauses = [];
        const params = [];
        
        if (updatedData.workerId !== undefined) {
            setClauses.push('worker_id = ?');
            params.push(updatedData.workerId);
        }
        
        if (updatedData.description) {
            setClauses.push('description = ?');
            params.push(updatedData.description);
        }
        
        if (updatedData.status) {
            setClauses.push('status = ?');
            params.push(updatedData.status);
        }
        
        // Add updated_at timestamp
        setClauses.push('updated_at = NOW()');
        
        // Only proceed if there are fields to update
        if (setClauses.length === 1 && setClauses[0] === 'updated_at = NOW()') {
            throw new Error('No se proporcionaron campos válidos para actualizar');
        }
        
        const query = `
            UPDATE TASKS 
            SET ${setClauses.join(', ')} 
            WHERE task_id = ?
        `;
        
        params.push(taskIdNum);
        
        // Execute the update query
        await getQuery(query, params);
        
        // Return the updated task
        return await this.getTaskById(taskIdNum);
    } catch (error) {
        console.error('Error en update:', error);
        throw new Error('Error updating task: ' + error.message);
    }
};

module.exports.getTaskById = async (taskId) => {
    try {
        const task = await getQuery('SELECT * FROM TASKS WHERE task_id = ?', [taskId], this.taskEntity);
        if (!task) {
            throw new Error('Tarea no encontrada');
        }
        return task;
    } catch (error) {
        if (error.message === 'Tarea no encontrada') {
            throw error;
        }
        throw new Error('Error al obtener la tarea de la base de datos');
    }
};
module.exports.deleteTask = async (taskId) => {
    try {
        if (!taskId) {
            throw new Error('Task ID is required for deletion');
        }
        
        const taskIdNum = Number(taskId);
        
        // First check if the task exists without throwing an error
        const taskExists = await getQuery('SELECT task_id FROM TASKS WHERE task_id = ?', [taskIdNum])
            .catch(() => null);
        
        // If no task found, return a success message
        if (!taskExists) {
            return { 
                success: true, 
                message: 'No action needed - task does not exist or was already deleted' 
            };
        }
        
        // Task exists, proceed with deletion using a direct SQL query
        const deleteQuery = 'DELETE FROM TASKS WHERE task_id = ?';
        await getQuery(deleteQuery, [taskIdNum]);
        
        return { success: true, message: 'Tarea eliminada correctamente' };
    } catch (error) {
        console.error('Error en delete:', error);
        throw new Error('Error deleting task: ' + error.message);
    }
};
module.exports.listTasks = async (filters = {}) => {
    let query = 'SELECT * FROM TASKS';
    const params = [];
    const conditions = [];
    if (filters.projectId) {
        conditions.push('project_id = ?');
        params.push(filters.projectId);
    }
    if (filters.workerId) {
        conditions.push('worker_id = ?');
        params.push(filters.workerId);
    }
    // Añadir filtro por estado
    if (filters.status) {
        conditions.push('status = ?');
        params.push(filters.status);
    }
    
    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY created_at DESC';
    
    try {
        const tasks = await findQuery(query, params, this.taskEntity);
        return tasks || [];
    } catch (error) {
        console.error('Error in listTasks:', error);
        throw new Error('Error listing tasks: ' + error.message);
    }
};

// Add this new function after the existing exports
module.exports.getAllTasks = async () => {
    try {
        const query = 'SELECT * FROM TASKS ORDER BY created_at DESC';
        const tasks = await findQuery(query, [], exports.taskEntity);
        return tasks || [];
    } catch (error) {
        throw new Error('Error getting all tasks: ' + error.message);
    }
};

// Add this function to your task-model.js file
module.exports.getTasksByStatus = async (status) => {
    try {
        if (!['Pending', 'In Progress', 'Completed'].includes(status)) {
            throw new Error('Invalid status value');
        }
        
        const query = 'SELECT * FROM TASKS WHERE status = ? ORDER BY created_at DESC';
        const tasks = await findQuery(query, [status], this.taskEntity);
        return tasks || [];
    } catch (error) {
        throw new Error('Error getting tasks by status: ' + error.message);
    }
};

// Add this new function to get tasks with related data
module.exports.getTasksWithRelatedData = async (filters = {}) => {
    try {
        let query = `
            SELECT t.*, 
                   p.project_name, p.description as project_description, p.status as project_status,
                   u.name as worker_name, u.email as worker_email
            FROM TASKS t
            INNER JOIN PROJECTS p ON t.project_id = p.project_id
            LEFT JOIN USERS u ON t.worker_id = u.user_id
        `;
        
        const params = [];
        const conditions = [];
        
        if (filters.projectId) {
            conditions.push('t.project_id = ?');
            params.push(filters.projectId);
        }
        
        if (filters.workerId) {
            conditions.push('t.worker_id = ?');
            params.push(filters.workerId);
        }
        
        if (filters.status) {
            conditions.push('t.status = ?');
            params.push(filters.status);
        }
        
        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        
        query += ' ORDER BY t.created_at DESC';
        
        const tasks = await findQuery(query, params, {
            ...this.taskEntity,
            projectName: type.string,
            projectDescription: type.string,
            projectStatus: type.string,
            workerName: type.string,
            workerEmail: type.string
        });
        
        return tasks || [];
    } catch (error) {
        console.error('Error in getTasksWithRelatedData:', error);
        throw new Error('Error getting tasks with related data: ' + error.message);
    }
};

// Enhance getTaskById to include related data
module.exports.getTaskByIdWithRelatedData = async (taskId) => {
    try {
        const query = `
            SELECT t.*, 
                   p.project_name, p.description as project_description, p.status as project_status,
                   u.name as worker_name, u.email as worker_email
            FROM TASKS t
            INNER JOIN PROJECTS p ON t.project_id = p.project_id
            LEFT JOIN USERS u ON t.worker_id = u.user_id
            WHERE t.task_id = ?
        `;
        
        const task = await getQuery(query, [taskId], {
            ...this.taskEntity,
            projectName: type.string,
            projectDescription: type.string,
            projectStatus: type.string,
            workerName: type.string,
            workerEmail: type.string
        });
        
        if (!task) {
            throw new Error('Tarea no encontrada');
        }
        
        return task;
    } catch (error) {
        if (error.message === 'Tarea no encontrada') {
            throw error;
        }
        throw new Error('Error al obtener la tarea con datos relacionados: ' + error.message);
    }
};

// Update getAllTasks to include related data
module.exports.getAllTasksWithRelatedData = async () => {
    try {
        const query = `
            SELECT t.*, 
                   p.project_name, p.description as project_description, p.status as project_status,
                   u.name as worker_name, u.email as worker_email
            FROM TASKS t
            INNER JOIN PROJECTS p ON t.project_id = p.project_id
            LEFT JOIN USERS u ON t.worker_id = u.user_id
            ORDER BY t.created_at DESC
        `;
        
        const tasks = await findQuery(query, [], {
            ...this.taskEntity,
            projectName: type.string,
            projectDescription: type.string,
            projectStatus: type.string,
            workerName: type.string,
            workerEmail: type.string
        });
        
        return tasks || [];
    } catch (error) {
        throw new Error('Error getting all tasks with related data: ' + error.message);
    }
};

// Additional Task Management Routes for Admin
module.exports.getTaskStats = async () => {
    try {
        // Primero, obtengamos los estados exactos que existen en la base de datos
        const statusQuery = `SELECT DISTINCT status FROM TASKS`;
        const statusResults = await findQuery(statusQuery, [], null);
        console.log('Estados disponibles en la base de datos:', statusResults);
        
        // Consulta directa para verificar cuántas tareas hay con cada estado
        const countQuery = `
            SELECT status, COUNT(*) as count 
            FROM TASKS 
            GROUP BY status
        `;
        const countResults = await findQuery(countQuery, [], null);
        console.log('Conteo por estado:', countResults);

        
        // Obtener directamente el conteo de cada estado para evitar problemas de conversión
        let total = 0;
        let completed = 0;
        let pending = 0;
        let inProgress = 0;
        
        // Procesar los resultados del conteo manualmente
        for (const result of countResults) {
            const count = parseInt(result.count);
            total += count;
            
            if (result.status === 'Completed') {
                completed = count;
            } else if (result.status === 'Pending') {
                pending = count;
            } else if (result.status === 'In Progress') {
                inProgress = count;
            }
        }
        
        console.log('Conteos procesados manualmente:', { total, completed, pending, inProgress });
        
        // Ahora, obtengamos el conteo de proyectos relacionados
        const projectQuery = `
            SELECT COUNT(DISTINCT p.project_id) as totalProjects
            FROM PROJECTS p
            INNER JOIN TASKS t ON p.project_id = t.project_id
        `;
        const [projectResult] = await findQuery(projectQuery, [], null);
        
        // Finalmente, obtengamos el conteo de trabajadores relacionados
        const workerQuery = `
            SELECT COUNT(DISTINCT u.user_id) as totalWorkers
            FROM USERS u
            INNER JOIN TASKS t ON u.user_id = t.worker_id
            WHERE t.worker_id IS NOT NULL
        `;
        const [workerResult] = await findQuery(workerQuery, [], null);
        
        return {
            total,
            completed,
            pending,
            inProgress,
            totalProjects: parseInt(projectResult?.totalProjects || 0),
            totalWorkers: parseInt(workerResult?.totalWorkers || 0)
        };
    } catch (error) {
        console.error('Error in getTaskStats:', error);
        throw new Error('Error getting task statistics: ' + error.message);
    }
};

// Add this function to get tasks by date range
module.exports.getTasksByDateRange = async (startDate, endDate) => {
    try {
        const query = `
            SELECT t.*, 
                   p.project_name, p.description as project_description, p.status as project_status,
                   u.name as worker_name, u.email as worker_email
            FROM TASKS t
            INNER JOIN PROJECTS p ON t.project_id = p.project_id
            LEFT JOIN USERS u ON t.worker_id = u.user_id
            WHERE t.created_at BETWEEN ? AND ?
            ORDER BY t.created_at DESC
        `;
        
        const tasks = await findQuery(query, [startDate, endDate], {
            ...this.taskEntity,
            projectName: type.string,
            projectDescription: type.string,
            projectStatus: type.string,
            workerName: type.string,
            workerEmail: type.string
        });
        
        return tasks || [];
    } catch (error) {
        console.error('Error in getTasksByDateRange:', error);
        throw new Error('Error getting tasks by date range: ' + error.message);
    }
};

// Add this function to get worker performance metrics
module.exports.getWorkerPerformance = async (workerId) => {
    try {
        const query = `
            SELECT 
                worker_id,
                COUNT(*) as totalTasks,
                SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completedTasks,
                SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as inProgressTasks,
                SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pendingTasks,
                ROUND((SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as completionRate
            FROM TASKS
            WHERE worker_id = ?
            GROUP BY worker_id
        `;
        
        const [result] = await findQuery(query, [workerId], null);
        
        if (!result) {
            return {
                workerId,
                totalTasks: 0,
                completedTasks: 0,
                inProgressTasks: 0,
                pendingTasks: 0,
                completionRate: 0
            };
        }
        
        return {
            workerId: result.worker_id,
            totalTasks: parseInt(result.totalTasks || 0),
            completedTasks: parseInt(result.completedTasks || 0),
            inProgressTasks: parseInt(result.inProgressTasks || 0),
            pendingTasks: parseInt(result.pendingTasks || 0),
            completionRate: parseFloat(result.completionRate || 0)
        };
    } catch (error) {
        console.error('Error in getWorkerPerformance:', error);
        throw new Error('Error getting worker performance: ' + error.message);
    }
};
