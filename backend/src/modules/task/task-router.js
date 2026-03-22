// modules/task/task-router.js
const express = require('express');
const router = express.Router();
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
} = require('./task-service');

const { auth } = require('../../util/router-util');
const yup = require('yup');

// Endpoint para crear una nueva tarea
router.post('/', auth, async (req, res) => {
    try {
        const schema = yup.object().shape({
            projectId: yup.number().required(),
            workerId: yup.number().nullable(),
            description: yup.string().required(),
            status: yup.string().oneOf(['Pending', 'In Progress', 'Completed']).nullable()
        });
        await schema.validate(req.body);
        const newTask = await createTask(req.body);
        res.status(201).json({ message: 'Task created successfully', task: newTask });
    } catch (error) {
        res.status(500).json({ message: 'Error creating task', error: error.message });
    }
});

// Endpoint para actualizar una tarea (por ejemplo, para cambiar su estado)
router.put('/:id', auth, async (req, res) => {
    try {
        const taskId = req.params.id;
        const schema = yup.object().shape({
            workerId: yup.number().nullable(),
            description: yup.string().nullable(),
            status: yup.string().oneOf(['Pending', 'In Progress', 'Completed']).nullable()
        });
        await schema.validate(req.body);
        const updatedTask = await updateTask(taskId, req.body);
        res.status(200).json({ message: 'Task updated successfully', task: updatedTask });
    } catch (error) {
        res.status(500).json({ message: 'Error updating task', error: error.message });
    }
});

// Endpoint para obtener una tarea por su ID
router.get('/:id', auth, async (req, res) => {
    try {
        const task = await getTaskById(req.params.id);
        res.status(200).json(task);
    } catch (error) {
        if (error.message === 'Tarea no encontrada') {
            return res.status(404).json({ 
                message: 'Task not found',
                error: error.message 
            });
        }
        res.status(500).json({ 
            message: 'Error fetching task', 
            error: error.message 
        });
    }
});

// Endpoint para eliminar una tarea
router.delete('/:id', auth, async (req, res) => {
    try {
        await deleteTask(req.params.id);
        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting task', error: error.message });
    }
});

// Endpoint para listar tareas, opcionalmente filtradas por projectId y/o workerId
router.get('/', auth, async (req, res) => {
    try {
        const filters = {};
        if (req.query.projectId) filters.projectId = parseInt(req.query.projectId, 10);
        if (req.query.workerId) filters.workerId = parseInt(req.query.workerId, 10);
        const tasks = await listTasks(filters);
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Error listing tasks', error: error.message });
    }
});

// Add this new endpoint before the module.exports
// Endpoint para obtener todas las tareas sin filtros
router.get('/all', auth, async (req, res) => {
    try {
        const tasks = await getAllTasks();
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching all tasks', error: error.message });
    }
});

// NEW ROUTE: Get all tasks
router.get('/', auth, async (req, res) => {
    try {
        const tasks = await getAllTasks();
        res.status(200).json({
            success: true,
            count: tasks.length,
            tasks
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error fetching all tasks', 
            error: error.message 
        });
    }
});

// NEW ROUTE: Get tasks by project ID
router.get('/project/:projectId', auth, async (req, res) => {
    try {
        const projectId = req.params.projectId;
        const tasks = await listTasks({ projectId });
        res.status(200).json({
            success: true,
            count: tasks.length,
            tasks
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error fetching tasks for project', 
            error: error.message 
        });
    }
});

// NEW ROUTE: Get tasks by worker ID
router.get('/worker/:workerId', auth, async (req, res) => {
    try {
        const workerId = req.params.workerId;
        const tasks = await listTasks({ workerId });
        res.status(200).json({
            success: true,
            count: tasks.length,
            tasks
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error fetching tasks for worker', 
            error: error.message 
        });
    }
});

// NEW ROUTE: Get tasks by status
router.get('/status/:status', auth, async (req, res) => {
    try {
        const status = req.params.status;
        // Validate status
        if (!['Pending', 'In Progress', 'Completed'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be one of: Pending, In Progress, Completed'
            });
        }
        
        // Usar el servicio importado en lugar de llamar directamente a findQuery
        const tasks = await listTasks({ status: status });
        
        res.status(200).json({
            success: true,
            count: tasks.length,
            tasks
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error fetching tasks by status', 
            error: error.message 
        });
    }
});

// Add this new route for getting tasks with related data
router.get('/detailed', auth, async (req, res) => {
    try {
        const filters = {};
        if (req.query.projectId) filters.projectId = parseInt(req.query.projectId, 10);
        if (req.query.workerId) filters.workerId = parseInt(req.query.workerId, 10);
        if (req.query.status) filters.status = req.query.status;
        
        const tasks = await getTasksWithRelatedData(filters);
        res.status(200).json({
            success: true,
            count: tasks.length,
            tasks
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error fetching detailed tasks', 
            error: error.message 
        });
    }
});

// Add this new route for getting a task by ID with related data
router.get('/detailed/:id', auth, async (req, res) => {
    try {
        const task = await getTaskByIdWithRelatedData(req.params.id);
        res.status(200).json({
            success: true,
            task
        });
    } catch (error) {
        if (error.message.includes('Tarea no encontrada')) {
            return res.status(404).json({ 
                success: false,
                message: 'Task not found',
                error: error.message 
            });
        }
        res.status(500).json({ 
            success: false,
            message: 'Error fetching detailed task', 
            error: error.message 
        });
    }
});

// Add this new route for getting all tasks with related data
router.get('/all/detailed', auth, async (req, res) => {
    try {
        const tasks = await getAllTasksWithRelatedData();
        res.status(200).json({
            success: true,
            count: tasks.length,
            tasks
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error fetching all detailed tasks', 
            error: error.message 
        });
    }
});

// Add these new admin routes

// Get task statistics
router.get('/admin/stats', auth, async (req, res) => {
    try {
    
        
        const stats = await getTaskStats();
        
        res.status(200).json({
            success: true,
            stats
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error fetching task statistics', 
            error: error.message 
        });
    }
});

// Get tasks by date range
router.get('/admin/date-range', auth, async (req, res) => {
    try {
    
        
        const { startDate, endDate } = req.query;
        
        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Start date and end date are required'
            });
        }
        
        const tasks = await getTasksByDateRange(new Date(startDate), new Date(endDate));
        res.status(200).json({
            success: true,
            count: tasks.length,
            tasks
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error fetching tasks by date range', 
            error: error.message 
        });
    }
});

// Get worker performance
router.get('/admin/worker-performance/:workerId', auth, async (req, res) => {
    try {
 
        
        const workerId = req.params.workerId;
        
        if (!workerId) {
            return res.status(400).json({
                success: false,
                message: 'Worker ID is required'
            });
        }
        
        const performance = await getWorkerPerformance(workerId);
        res.status(200).json({
            success: true,
            performance
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error fetching worker performance', 
            error: error.message 
        });
    }
});

// Bulk assign tasks to worker
router.post('/admin/bulk-assign', auth, async (req, res) => {
    try {
        
        
        const { taskIds, workerId } = req.body;
        
        if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Task IDs array is required'
            });
        }
        
        if (!workerId) {
            return res.status(400).json({
                success: false,
                message: 'Worker ID is required'
            });
        }
        
        // Update each task
        const updatePromises = taskIds.map(taskId => 
            updateTask(taskId, { workerId })
        );
        
        await Promise.all(updatePromises);
        
        res.status(200).json({
            success: true,
            message: `${taskIds.length} tasks assigned to worker ${workerId} successfully`
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error bulk assigning tasks', 
            error: error.message 
        });
    }
});

// Bulk update task status
router.post('/admin/bulk-update-status', auth, async (req, res) => {
    try {

        
        const { taskIds, status } = req.body;
        
        if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Task IDs array is required'
            });
        }
        
        if (!status || !['Pending', 'In Progress', 'Completed'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Valid status is required (Pending, In Progress, Completed)'
            });
        }
        
        // Update each task
        const updatePromises = taskIds.map(taskId => 
            updateTask(taskId, { status })
        );
        
        await Promise.all(updatePromises);
        
        res.status(200).json({
            success: true,
            message: `${taskIds.length} tasks updated to status "${status}" successfully`
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error bulk updating task status', 
            error: error.message 
        });
    }
});
module.exports = router;
