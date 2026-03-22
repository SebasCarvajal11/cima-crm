// src/pages/projects/components/Notification.js
import React, { useContext } from 'react';
import { ProjectContext } from '../../../context/ProjectContext';
import { Snackbar, Alert } from '@mui/material';

const Notification = () => {
  const { notification, setNotification } = useContext(ProjectContext);

  // Asegurarse de que notification tenga valores por defecto
  const { open = false, message = '', type = 'info' } = notification || {};

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setNotification(prev => ({ ...prev, open: false }));
  };

  return (
    <Snackbar 
      open={open} 
      autoHideDuration={6000} 
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert 
        onClose={handleClose} 
        severity={type} 
        variant="filled"
        sx={{ width: '100%' }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Notification;
