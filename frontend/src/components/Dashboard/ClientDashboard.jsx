import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  Card,
  CardContent,
  Avatar,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Mail as MailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Star as StarIcon
} from '@mui/icons-material';

const ClientManagement = () => {
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const clientCategories = [
    { label: 'Todos', count: 150 },
    { label: 'Activos', count: 89 },
    { label: 'Premium', count: 34 },
    { label: 'Nuevos', count: 27 }
  ];

  const clients = [
    {
      id: 1,
      name: 'Empresa Innovadora S.A.',
      contact: 'María González',
      email: 'maria@empresainnovadora.com',
      phone: '+34 612 345 678',
      status: 'Premium',
      lastPurchase: '2024-03-15',
      revenue: '€25,000',
      avatar: 'EI'
    },
    // ... más clientes
  ];

  return (
    <Box sx={{ p: 4, background: 'linear-gradient(135deg, #f6f9fc 0%, #f1f5f9 100%)', minHeight: '100vh' }}>
      {/* Header Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Typography 
            variant="h3" 
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(45deg, #2c3e50 30%, #3498db 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent'
            }}
          >
            Gestión de Clientes
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
            Administra y supervisa toda la información de tus clientes en un solo lugar
          </Typography>
        </Grid>
        <Grid item xs={12} md={4} sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            sx={{ borderRadius: 2 }}
          >
            Exportar
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              background: 'linear-gradient(45deg, #3498db 30%, #2980b9 90%)',
              borderRadius: 2
            }}
          >
            Nuevo Cliente
          </Button>
        </Grid>
      </Grid>

      {/* Search and Filter Section */}
      <Paper sx={{ p: 2, mb: 4, borderRadius: 3, display: 'flex', gap: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar clientes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
          sx={{ maxWidth: 400 }}
        />
        <Button
          startIcon={<FilterIcon />}
          sx={{ minWidth: 130 }}
        >
          Filtros
        </Button>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {clientCategories.map((category) => (
          <Grid item xs={12} sm={6} md={3} key={category.label}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                background: 'white',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
                }
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {category.count}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                {category.label}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Client Cards */}
      <Grid container spacing={3}>
        {clients.map((client) => (
          <Grid item xs={12} md={6} lg={4} key={client.id}>
            <Card 
              sx={{
                borderRadius: 3,
                '&:hover': {
                  boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: '#3498db',
                      width: 56,
                      height: 56,
                      mr: 2
                    }}
                  >
                    {client.avatar}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {client.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {client.contact}
                    </Typography>
                  </Box>
                  <Chip 
                    label={client.status}
                    color="primary"
                    size="small"
                    sx={{ ml: 'auto' }}
                  />
                </Box>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <MailIcon fontSize="small" color="action" />
                      <Typography variant="body2">{client.email}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PhoneIcon fontSize="small" color="action" />
                      <Typography variant="body2">{client.phone}</Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Última compra: {client.lastPurchase}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {client.revenue}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 1 }}>
                  <IconButton size="small" sx={{ color: '#3498db' }}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" sx={{ color: '#e74c3c' }}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ClientManagement;
