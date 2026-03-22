import React, { useState, useEffect } from 'react';
import './WorkerTasks.css'; // Archivo CSS para estilos

const WorkerTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusUpdates, setStatusUpdates] = useState({});
  const [comments, setComments] = useState({});

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        // Simulación de tareas obtenidas de una API
        const response = [
          { id: 1, name: 'Tarea A', status: 'En progreso', description: 'Descripción de la tarea A' },
          { id: 2, name: 'Tarea B', status: 'En progreso', description: 'Descripción de la tarea B' },
          { id: 3, name: 'Tarea C', status: 'Pendiente', description: 'Descripción de la tarea C' },
        ];
        setTasks(response);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar las tareas.');
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const handleStatusChange = (taskId, newStatus) => {
    setStatusUpdates((prevUpdates) => ({
      ...prevUpdates,
      [taskId]: newStatus,
    }));
  };

  const handleCommentChange = (taskId, newComment) => {
    setComments((prevComments) => ({
      ...prevComments,
      [taskId]: newComment,
    }));
  };

  const handleUpdateTask = (taskId) => {
    const updatedStatus = statusUpdates[taskId];
    const taskComment = comments[taskId];
    if (updatedStatus || taskComment) {
      const updatedTasks = tasks.map((task) =>
        task.id === taskId ? { ...task, status: updatedStatus || task.status, comment: taskComment || '' } : task
      );
      setTasks(updatedTasks);
      alert(`Tarea ${taskId} actualizada.`);
    }
  };

  if (loading) return <p>Cargando tareas...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="worker-tasks-container">
      <h1>Tareas Asignadas</h1>
      {tasks.length === 0 ? (
        <p>No tienes tareas asignadas en este momento.</p>
      ) : (
        <ul className="task-list">
          {tasks.map((task) => (
            <li key={task.id} className="task-item">
              <h2>{task.name}</h2>
              <p>Estado actual: {task.status}</p>
              <p>Descripción: {task.description}</p>
              
              {/* Formulario para actualizar estado de la tarea */}
              <label htmlFor={`status-${task.id}`}>Actualizar Estado:</label>
              <select
                id={`status-${task.id}`}
                value={statusUpdates[task.id] || task.status}
                onChange={(e) => handleStatusChange(task.id, e.target.value)}
              >
                <option value="Pendiente">Pendiente</option>
                <option value="En progreso">En progreso</option>
                <option value="Completado">Completado</option>
              </select>

              {/* Campo de comentario */}
              <label htmlFor={`comment-${task.id}`}>Agregar Comentario:</label>
              <textarea
                id={`comment-${task.id}`}
                value={comments[task.id] || ''}
                onChange={(e) => handleCommentChange(task.id, e.target.value)}
                placeholder="Escribe un comentario sobre el progreso de la tarea"
              />

              {/* Botón para actualizar tarea */}
              <button
                className="btn-update-task"
                onClick={() => handleUpdateTask(task.id)}
              >
                Actualizar Tarea
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default WorkerTasks;
