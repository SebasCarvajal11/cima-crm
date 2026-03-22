// modules/task/task-service.js

const { 
    createTask, 
    updateTask, 
    getTaskById, 
    deleteTask, 
    listTasks,
    getAllTasks,
    getTasksWithRelatedData,
    getTaskByIdWithRelatedData,
    getAllTasksWithRelatedData,
    getTaskStats,
    getTasksByDateRange,
    getWorkerPerformance
} = require('./task-model');

module.exports.createTask = async (taskData) => {
    try {
        const newTask = await createTask(taskData);
        return newTask;
    } catch (error) {
        throw new Error('Error al crear la tarea: ' + error.message);
    }
};

module.exports.updateTask = async (taskId, updatedData) => {
    try {
        const updatedTask = await updateTask(taskId, updatedData);
        if (!updatedTask) {
            throw new Error('No se pudo actualizar la tarea.');
        }
        return updatedTask;
    } catch (error) {
        throw new Error('Error al actualizar la tarea: ' + error.message);
    }
};

module.exports.getTaskById = async (taskId) => {
    try {
        const task = await getTaskById(taskId);
        return task;
    } catch (error) {
        throw new Error(error.message);
    }
};

module.exports.deleteTask = async (taskId) => {
    try {
        const result = await deleteTask(taskId);
        return result;
    } catch (error) {
        throw new Error('Error al eliminar la tarea: ' + error.message);
    }
};

module.exports.listTasks = async (filters = {}) => {
    try {
        const tasks = await listTasks(filters);
        return tasks;
    } catch (error) {
        throw new Error('Error al listar las tareas: ' + error.message);
    }
};

// Add this to your task-service.js file
module.exports.getTasksByStatus = async (status) => {
    try {
        const tasks = await getTasksByStatus(status);
        return tasks;
    } catch (error) {
        throw new Error('Error al obtener tareas por estado: ' + error.message);
    }
};

// Add these new functions to your task-service.js file

// Exportar las funciones que faltan
module.exports.getTasksWithRelatedData = async (filters = {}) => {
    try {
        return await getTasksWithRelatedData(filters);
    } catch (error) {
        throw new Error('Error al obtener tareas con datos relacionados: ' + error.message);
    }
};

module.exports.getTaskByIdWithRelatedData = async (taskId) => {
    try {
        return await getTaskByIdWithRelatedData(taskId);
    } catch (error) {
        throw new Error('Error al obtener tarea con datos relacionados: ' + error.message);
    }
};

module.exports.getAllTasksWithRelatedData = async () => {
    try {
        return await getAllTasksWithRelatedData();
    } catch (error) {
        throw new Error('Error al obtener todas las tareas con datos relacionados: ' + error.message);
    }
};

module.exports.getTaskStats = async () => {
    try {
        return await getTaskStats();
    } catch (error) {
        throw new Error('Error al obtener estadísticas de tareas: ' + error.message);
    }
};

module.exports.getTasksByDateRange = async (startDate, endDate) => {
    try {
        return await getTasksByDateRange(startDate, endDate);
    } catch (error) {
        throw new Error('Error al obtener tareas por rango de fechas: ' + error.message);
    }
};

module.exports.getWorkerPerformance = async (workerId) => {
    try {
        return await getWorkerPerformance(workerId);
    } catch (error) {
        throw new Error('Error al obtener rendimiento del trabajador: ' + error.message);
    }
};
  