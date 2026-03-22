// components/Client/EditClient.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getClientById, updateClient } from '../../redux/slices/clientSlice';
import { useParams } from 'react-router-dom';
import './EditClient.css';
const EditClient = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { client } = useSelector((state) => state.clients);
  
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    address: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    dispatch(getClientById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (client) {
      setFormData(client);
    }
  }, [client]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateClient({ id, ...formData }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Nombre"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      {/* Similar para otros campos */}
      <button type="submit">Actualizar Cliente</button>
    </form>
  );
};

export default EditClient;
