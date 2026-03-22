import React from 'react';
import { useDispatch } from 'react-redux';
import { deleteClient } from '../../redux/slices/clientSlice';

const DeleteClient = ({ clientId }) => {
  const dispatch = useDispatch();

  const handleDelete = () => {
    dispatch(deleteClient(clientId));  // Acción para eliminar cliente
  };

  return <button onClick={handleDelete}>Delete</button>;
};

export default DeleteClient;
