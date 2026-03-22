import React from 'react';
import './CustomerSupport.css';
import { Email as EmailIcon } from '@mui/icons-material';

const CustomerSupport = () => {
  return (
    <div className="support-container">
      <div className="support-card">
        <div className="support-header">
          <h2>Soporte al Cliente</h2>
        </div>
        <div className="support-content">
          <div className="support-icon">
            <EmailIcon fontSize="large" />
          </div>
          <p className="support-message">
            Para cualquier consulta o asistencia, por favor comuníquese con nuestro equipo de soporte al siguiente correo electrónico:
          </p>
          <a href="mailto:annyul.editorial@gmail.com" className="support-email">
            annyul.editorial@gmail.com
          </a>
          <p className="support-note">
            Nuestro equipo estará encantado de ayudarle con cualquier pregunta o problema que pueda tener.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomerSupport;