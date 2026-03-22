import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchClientHistory } from '../../redux/slices/clientSlice';
import { useParams } from 'react-router-dom';

const ClientHistory = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const history = useSelector((state) => state.clients.history);
  const status = useSelector((state) => state.clients.status);

  useEffect(() => {
    dispatch(fetchClientHistory(id));  // Acción para obtener historial de cliente
  }, [dispatch, id]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Client History</h2>
      <ul>
        {history.map((interaction, index) => (
          <li key={index}>{interaction}</li>
        ))}
      </ul>
    </div>
  );
};

export default ClientHistory;
