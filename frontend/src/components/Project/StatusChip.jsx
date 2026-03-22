import React from 'react';
import { Chip } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledChip = styled(Chip)(({ theme, status }) => {
  const colors = {
    'Pending': {
      bg: theme.palette.warning.main,
      color: theme.palette.warning.contrastText
    },
    'In Progress': {
      bg: theme.palette.info.main,
      color: theme.palette.info.contrastText
    },
    'Completed': {
      bg: theme.palette.success.main,
      color: theme.palette.success.contrastText
    }
  };
  
  const statusColor = colors[status] || { 
    bg: theme.palette.grey[500], 
    color: theme.palette.common.white 
  };
  
  return {
    backgroundColor: statusColor.bg,
    color: statusColor.color,
    fontWeight: 500,
    '&:hover': {
      backgroundColor: statusColor.bg,
      opacity: 0.9
    }
  };
});

const StatusChip = ({ label, status, size = 'medium' }) => {
  return (
    <StyledChip
      label={label}
      status={status}
      size={size}
    />
  );
};

export default StatusChip; 