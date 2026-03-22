import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  LinearProgress
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';

const StatCard = ({ title, value, icon, color }) => (
  <Paper
    elevation={2}
    sx={{
      p: 2,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: 'background.paper',
      border: '2px solid',
      borderColor: `${color}.main`,
      color: '#592d2d'  // Updated text color
    }}
  >
    <Box display="flex" alignItems="center" mb={1}>
      {icon}
      <Typography variant="h6" component="div" ml={1} sx={{ color: '#000000' }}>
        {title}
      </Typography>
    </Box>
    <Typography variant="h4" component="div" sx={{ color: '#000000' }}>
      {value}
    </Typography>
    <LinearProgress
      variant="determinate"
      value={100}
      sx={{
        mt: 2,
        bgcolor: `${color}.lighter`,
        '& .MuiLinearProgress-bar': {
          bgcolor: `${color}.main`
        }
      }}
    />
  </Paper>
);

const ProjectStats = ({ stats }) => {
  console.log(stats )
  const {
    total = 0,
    completed = 0,
    pending = 0,
    inProgress = 0
  } = stats || {};

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Total Proyectos"
          value={total}
          icon={<AssignmentIcon fontSize="large" />}
          color="primary"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Completados"
          value={completed}
          icon={<CheckCircleIcon fontSize="large" />}
          color="success"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Pendientes"
          value={pending}
          icon={<PendingIcon fontSize="large" />}
          color="warning"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="En Progreso"
          value={inProgress}
          icon={<TimelineIcon fontSize="large" />}
          color="info"
        />
      </Grid>
    </Grid>
  );
};

export default ProjectStats;
