import React, { useState, useEffect } from 'react';
import { faqService } from '../../services/faqService';
import './FaqAdmin.css';
import { 
  CircularProgress, TextField, Button, Paper, Typography, IconButton, 
  Snackbar, Alert, InputAdornment, Grid, Card, CardContent, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, Divider,
  Tabs, Tab, Box, Tooltip
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Save as SaveIcon, 
  Cancel as CancelIcon, 
  Search as SearchIcon,
  QuestionAnswer as FaqIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Help as HelpIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as PendingIcon
} from '@mui/icons-material';

const FaqAdmin = () => {
  // State variables
  const [faqs, setFaqs] = useState([]);
  const [filteredFaqs, setFilteredFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [editFaq, setEditFaq] = useState(null);
  const [editQuestion, setEditQuestion] = useState('');
  const [editAnswer, setEditAnswer] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [faqToDelete, setFaqToDelete] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    draft: 0
  });

  // Fetch all FAQs on component mount
  useEffect(() => {
    fetchFaqs();
  }, []);

  // Update filtered FAQs when faqs or filter changes
  useEffect(() => {
    filterFaqs();
  }, [faqs, activeFilter, searchTerm]);

  // Function to fetch all FAQs
  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const fetchedFaqs = await faqService.getAllFaqs();
      setFaqs(fetchedFaqs || []);
      
      // Update stats
      setStats({
        total: fetchedFaqs ? fetchedFaqs.length : 0,
        active: fetchedFaqs ? fetchedFaqs.filter(faq => !faq.isDeleted).length : 0,
        draft: fetchedFaqs ? fetchedFaqs.filter(faq => faq.isDeleted).length : 0
      });
      
      setError(null);
    } catch (err) {
      setError('Error al cargar las preguntas frecuentes. Por favor, intenta de nuevo.');
      console.error('Error fetching FAQs:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter FAQs based on active filter and search term
  const filterFaqs = () => {
    let filtered = [...faqs];
    
    // Apply status filter
    if (activeFilter === 'active') {
      filtered = filtered.filter(faq => !faq.isDeleted);
    } else if (activeFilter === 'draft') {
      filtered = filtered.filter(faq => faq.isDeleted);
    }
    
    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        faq => 
          faq.question.toLowerCase().includes(term) || 
          faq.answer.toLowerCase().includes(term)
      );
    }
    
    setFilteredFaqs(filtered);
  };

  // Function to search FAQs
  const handleSearch = async () => {
    if (searchTerm.trim()) {
      try {
        setLoading(true);
        const searchResults = await faqService.searchFaqs(searchTerm);
        setFilteredFaqs(searchResults || []);
      } catch (err) {
        showNotification('Error al buscar preguntas', 'error');
        console.error('Error searching FAQs:', err);
      } finally {
        setLoading(false);
      }
    } else {
      filterFaqs(); // If search term is empty, apply current filters
    }
  };

  // Function to add a new FAQ
  const handleAddFaq = async () => {
    if (newQuestion.trim() && newAnswer.trim()) {
      try {
        setLoading(true);
        const newFaq = await faqService.createFaq({
          question: newQuestion,
          answer: newAnswer
        });
        
        setFaqs([...faqs, newFaq]);
        setNewQuestion('');
        setNewAnswer('');
        showNotification('Pregunta añadida correctamente', 'success');
      } catch (err) {
        showNotification('Error al añadir la pregunta', 'error');
        console.error('Error adding FAQ:', err);
      } finally {
        setLoading(false);
      }
    } else {
      showNotification('Por favor, completa todos los campos', 'warning');
    }
  };

  // Function to delete a FAQ
  const handleDeleteFaq = async () => {
    if (!faqToDelete) return;
    
    try {
      setLoading(true);
      await faqService.deleteFaq(faqToDelete);
      setFaqs(faqs.filter(faq => faq._id !== faqToDelete));
      showNotification('Pregunta eliminada correctamente', 'success');
    } catch (err) {
      showNotification('Error al eliminar la pregunta', 'error');
      console.error('Error deleting FAQ:', err);
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setFaqToDelete(null);
    }
  };

  // Function to open delete confirmation dialog
  const openDeleteDialog = (id) => {
    setFaqToDelete(id);
    setDeleteDialogOpen(true);
  };

  // Function to start editing a FAQ
  const handleEditFaq = (faq) => {
    console.log('Attempting to edit FAQ:', JSON.stringify(faq));
    
    if (!faq) {
      console.error('Cannot edit FAQ: Missing FAQ object');
      showNotification('Error: No se puede editar esta pregunta (objeto no encontrado)', 'error');
      return;
    }
    
    // Check for faqId instead of _id
    const faqId = faq.faqId || faq._id;
    
    if (!faqId) {
      console.error('Cannot edit FAQ: Missing FAQ ID', faq);
      showNotification('Error: No se puede editar esta pregunta (ID no encontrado)', 'error');
      return;
    }
    
    console.log('Starting edit for FAQ with ID:', faqId);
    setEditFaq(faqId);
    setEditQuestion(faq.question || '');
    setEditAnswer(faq.answer || '');
  };

  // Function to save edited FAQ
  const handleSaveFaq = async (id) => {
    console.log('Attempting to save FAQ with ID:', id);
    
    if (!id) {
      console.error('Cannot save FAQ: Missing FAQ ID');
      showNotification('Error: ID de pregunta no válido', 'error');
      return;
    }
    
    if (editQuestion.trim() && editAnswer.trim()) {
      try {
        setLoading(true);
        
        const updatedFaqData = {
          question: editQuestion,
          answer: editAnswer
        };
        
        console.log(`Saving FAQ with ID: ${id}`, updatedFaqData);
        
        const updatedFaq = await faqService.updateFaq(id, updatedFaqData);
        
        console.log('Updated FAQ received:', updatedFaq);
        
        // Update the faqs state with the updated FAQ
        setFaqs(prevFaqs => 
          prevFaqs.map(faq => 
            faq._id === id ? { ...faq, ...updatedFaq } : faq
          )
        );
        
        // Reset edit state
        setEditFaq(null);
        setEditQuestion('');
        setEditAnswer('');
        
        showNotification('Pregunta actualizada correctamente', 'success');
      } catch (err) {
        console.error('Error in handleSaveFaq:', err);
        showNotification(`Error al actualizar la pregunta: ${err.message}`, 'error');
      } finally {
        setLoading(false);
      }
    } else {
      showNotification('Por favor, completa todos los campos', 'warning');
    }
  };

  // Function to cancel editing
  const handleCancelEdit = () => {
    setEditFaq(null);
    setEditQuestion('');
    setEditAnswer('');
  };

  // Function to show notification
  const showNotification = (message, severity) => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  // Function to close notification
  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  // Function to handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Function to handle filter change
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  return (
    <div className="faq-admin-container">
      {/* Header Section */}
      <div className="faq-admin-header">
        <Typography variant="h4" component="h1" gutterBottom>
          Gestión de Preguntas Frecuentes
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Administra las preguntas frecuentes para ayudar a tus usuarios
        </Typography>
      </div>

      {/* Stats Section */}
      <div className="faq-stats">
        <div className="faq-stat-card">
          <div className="stat-icon total">
            <FaqIcon />
          </div>
          <Typography variant="h3">{stats.total}</Typography>
          <Typography variant="body2">Total de preguntas</Typography>
        </div>
        <div className="faq-stat-card">
          <div className="stat-icon active">
            <CheckCircleIcon />
          </div>
          <Typography variant="h3">{stats.active}</Typography>
          <Typography variant="body2">Preguntas activas</Typography>
        </div>
        <div className="faq-stat-card">
          <div className="stat-icon draft">
            <PendingIcon />
          </div>
          <Typography variant="h3">{stats.draft}</Typography>
          <Typography variant="body2">Preguntas en borrador</Typography>
        </div>
      </div>

      {/* Tabs Section */}
      <Paper className="faq-tabs">
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="Todas las preguntas" icon={<FaqIcon />} />
          <Tab label="Añadir nueva pregunta" icon={<AddIcon />} />
        </Tabs>
      </Paper>

      {/* Tab Panel Content */}
      <div className="faq-tab-panel" hidden={tabValue !== 0}>
        {/* Search and Filter Section */}
        <Paper className="search-container" elevation={0}>
          <Grid container spacing={2} alignItems="center" padding={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Buscar preguntas frecuentes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearchTerm('')}>
                        <CancelIcon />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <div className="faq-filters">
                <Button
                  variant={activeFilter === 'all' ? 'contained' : 'outlined'}
                  color="primary"
                  onClick={() => handleFilterChange('all')}
                  startIcon={<FilterIcon />}
                  className={`faq-filter-button ${activeFilter === 'all' ? 'active' : ''}`}
                >
                  Todas
                </Button>
                <Button
                  variant={activeFilter === 'active' ? 'contained' : 'outlined'}
                  color="primary"
                  onClick={() => handleFilterChange('active')}
                  startIcon={<CheckCircleIcon />}
                  className={`faq-filter-button ${activeFilter === 'active' ? 'active' : ''}`}
                >
                  Activas
                </Button>
                <Button
                  variant={activeFilter === 'draft' ? 'contained' : 'outlined'}
                  color="primary"
                  onClick={() => handleFilterChange('draft')}
                  startIcon={<PendingIcon />}
                  className={`faq-filter-button ${activeFilter === 'draft' ? 'active' : ''}`}
                >
                  Borradores
                </Button>
                <Tooltip title="Actualizar">
                  <IconButton color="primary" onClick={fetchFaqs}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </div>
            </Grid>
          </Grid>
        </Paper>

        {/* FAQ List */}
        {loading ? (
          <div className="loading-container">
            <CircularProgress />
          </div>
        ) : error ? (
          <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
        ) : filteredFaqs.length === 0 ? (
          <div className="faq-empty-state">
            <HelpIcon />
            <Typography variant="h6">No se encontraron preguntas</Typography>
            <Typography variant="body2">
              {searchTerm ? 'Intenta con otra búsqueda o' : 'Comienza'} añadiendo una nueva pregunta frecuente.
            </Typography>
          </div>
        ) : (
          <div className="faq-list">
            {filteredFaqs.map((faq) => (
              <Card key={faq.faqId} className="faq-item">
                {editFaq === faq.faqId ? (
                  <CardContent className="faq-edit-container">
                    <Typography variant="h6" gutterBottom>
                      Editar Pregunta
                    </Typography>
                    <TextField
                      fullWidth
                      label="Pregunta"
                      variant="outlined"
                      value={editQuestion}
                      onChange={(e) => setEditQuestion(e.target.value)}
                      margin="normal"
                    />
                    <TextField
                      fullWidth
                      label="Respuesta"
                      variant="outlined"
                      value={editAnswer}
                      onChange={(e) => setEditAnswer(e.target.value)}
                      margin="normal"
                      multiline
                      rows={4}
                    />
                    <div className="faq-actions">
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<SaveIcon />}
                        onClick={() => handleSaveFaq(faq.faqId)}
                        disabled={loading}
                      >
                        Guardar
                      </Button>
                      <Button
                        variant="outlined"
                        color="secondary"
                        startIcon={<CancelIcon />}
                        onClick={handleCancelEdit}
                        sx={{ ml: 1 }}
                        disabled={loading}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </CardContent>
                ) : (
                  <CardContent className="faq-view-container">
                    <Chip 
                      label={faq.isDeleted ? "Borrador" : "Activa"} 
                      color={faq.isDeleted ? "default" : "success"}
                      size="small"
                      className={`faq-status-badge ${faq.isDeleted ? 'draft' : 'active'}`}
                    />
                    <Typography variant="h6" component="h2">
                      {faq.question}
                    </Typography>
                    <Typography variant="body1" component="p">
                      {faq.answer}
                    </Typography>
                    <div className="faq-actions">
                      <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<EditIcon />}
                        onClick={() => {
                          console.log('Edit button clicked for FAQ:', filteredFaqs.find(f => f._id === faq._id));
                          handleEditFaq(faq);
                        }}
                        size="small"
                      >
                        Editar
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => openDeleteDialog(faq.faqId)}
                        size="small"
                        sx={{ ml: 1 }}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add FAQ Panel */}
      <div className="faq-tab-panel" hidden={tabValue !== 1}>
        <Paper className="faq-add-container">
          <Typography variant="h6" component="h2" gutterBottom>
            <AddIcon /> Añadir Nueva Pregunta Frecuente
          </Typography>
          <TextField
            fullWidth
            label="Pregunta"
            variant="outlined"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            margin="normal"
            placeholder="Escribe la pregunta aquí..."
          />
          <TextField
            fullWidth
            label="Respuesta"
            variant="outlined"
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            margin="normal"
            multiline
            rows={4}
            placeholder="Escribe la respuesta detallada aquí..."
          />
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddFaq}
              disabled={loading || !newQuestion.trim() || !newAnswer.trim()}
            >
              Añadir Pregunta
            </Button>
          </Box>
        </Paper>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar esta pregunta frecuente? Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleDeleteFaq} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>

      {/* Loading Overlay */}
      {loading && (
        <div className="loading-overlay">
          <CircularProgress />
        </div>
      )}
    </div>
  );
};

export default FaqAdmin;