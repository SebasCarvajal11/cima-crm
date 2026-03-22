// src/pages/projects/components/ProjectList.js
  import React from 'react';
  import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    TablePagination,
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Tooltip,
    Skeleton,
    TableSortLabel,
    Box,
  } from '@mui/material';
  import SearchIcon from '@mui/icons-material/Search';
  import EditIcon from '@mui/icons-material/Edit';
  import DeleteIcon from '@mui/icons-material/Delete';
  import StatusChip from '../StatusChip';

  const ProjectList = ({ projects = [], loading, onEdit, onDelete }) => {
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [openDialog, setOpenDialog] = React.useState(false);
    const [projectToDelete, setProjectToDelete] = React.useState(null);
    const [orderBy, setOrderBy] = React.useState('projectName');
    const [order, setOrder] = React.useState('asc');

    const handleChangePage = (event, newPage) => {
      setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    };

    const handleRequestSort = (property) => {
      const isAsc = orderBy === property && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(property);
    };

    const handleDeleteClick = (project) => {
      setProjectToDelete(project);
      setOpenDialog(true);
    };

    const handleDeleteConfirm = () => {
      if (projectToDelete) {
        onDelete(projectToDelete.id);
      }
      setOpenDialog(false);
    };

    const handleEdit = (project) => {
      //console.log.log('Enviando proyecto a editar:', project);
      
      // Crear una copia del proyecto con id si no existe
      const projectToEdit = {
        ...project,
        id: project.id || project.projectId // Usar projectId como fallback
      };
      
      //console.log.log('Proyecto normalizado para editar:', projectToEdit);
      
      if (!projectToEdit.id) {
        console.error('Proyecto inválido para editar, sin ID:', project);
        return;
      }
      
      onEdit(projectToEdit);
    };

    const handleDelete = async (project) => {
      try {
        // Usar projectId si id no está disponible
        const idToDelete = project.id || project.projectId;
        if (!idToDelete) {
          console.error('No se puede eliminar proyecto sin ID:', project);
          return;
        }
        await onDelete(idToDelete);
      } catch (error) {
        console.error('Error al eliminar el proyecto:', error);
      }
    };

    // Filtrar y ordenar proyectos
    const filteredProjects = projects && projects.length > 0 
      ? projects
          .filter((project) =>
            Object.values(project).some((value) =>
              String(value).toLowerCase().includes(searchTerm.toLowerCase())
            )
          )
          .sort((a, b) => {
            const isAsc = order === 'asc';
            if (!a[orderBy]) return -1;
            if (!b[orderBy]) return 1;
            return isAsc
              ? String(a[orderBy]).localeCompare(String(b[orderBy]))
              : String(b[orderBy]).localeCompare(String(a[orderBy]));
          })
      : [];

    const getStatusLabel = (status) => {
      switch (status) {
        case 'Pending': return 'Pendiente';
        case 'In Progress': return 'En Progreso';
        case 'Completed': return 'Completado';
        default: return status;
      }
    };

    if (loading) {
      return (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell colSpan={5}>
                  <Skeleton animation="wave" height={50} />
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[...Array(5)].map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton animation="wave" /></TableCell>
                  <TableCell><Skeleton animation="wave" /></TableCell>
                  <TableCell><Skeleton animation="wave" /></TableCell>
                  <TableCell><Skeleton animation="wave" /></TableCell>
                  <TableCell><Skeleton animation="wave" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
    }

    return (
      <Box>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar proyectos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
        />

        <TableContainer 
          component={Paper} 
          sx={{ 
            mt: 2,
            boxShadow: 3,
            borderRadius: 2,
            '& .MuiTable-root': {
              minWidth: 650,
            }
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#592d2d' }}>
                {['Client ID', 'Nombre del Proyecto', 'Descripción', 'Estado', 'Acciones'].map((header, index) => (
                  <TableCell 
                    key={header}
                    sx={{ color: '#8e3031', fontWeight: 'bold' }}
                  >
                    {index < 4 ? (
                      <TableSortLabel
                        active={orderBy === header.toLowerCase()}
                        direction={orderBy === header.toLowerCase() ? order : 'asc'}
                        onClick={() => handleRequestSort(header.toLowerCase())}
                        sx={{
                          color: '  #8e3031 !important',
                          '&.MuiTableSortLabel-root:hover': {
                            color: '#f0f0f0',
                          },
                          '& .MuiTableSortLabel-icon': {
                            color: 'white !important',
                          },
                        }}
                      >
                        {header}
                      </TableSortLabel>
                    ) : (
                      header
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No hay proyectos disponibles
                  </TableCell>
                </TableRow>
              ) : (
                filteredProjects
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((project) => (
                    <TableRow 
                      key={project.id}
                      sx={{ 
                        '&:hover': { 
                          backgroundColor: 'action.hover' 
                        }
                      }}
                    >
                      <TableCell sx={{ color: '#592d2d' }}>{project.clientId}</TableCell>
                      <TableCell sx={{ color: '#592d2d' }}>{project.projectName}</TableCell>
                      <TableCell sx={{ color: '#592d2d' }}>{project.description}</TableCell>
                      <TableCell>
                        <StatusChip
                          label={getStatusLabel(project.status)}
                          status={project.status}
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Editar proyecto">
                          <Button 
                            variant="contained" 
                            sx={{ 
                              mr: 1,
                              bgcolor: 'black',
                              '&:hover': {
                                bgcolor: '#333333'
                              }
                            }}
                            size="small"
                            onClick={() => handleEdit(project)}
                          >
                            <EditIcon fontSize="small" />
                          </Button>
                        </Tooltip>
                        <Tooltip title="Eliminar proyecto">
                          <Button 
                            variant="contained" 
                            sx={{ 
                              bgcolor: 'red',
                              '&:hover': {
                                bgcolor: '#a03738'
                              }
                            }}
                            size="small"
                            onClick={() => handleDelete(project)}
                          >
                            <DeleteIcon fontSize="small" />
                          </Button>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filteredProjects.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} de ${count}`}
        />

        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
        >
          <DialogTitle>Confirmar eliminación</DialogTitle>
          <DialogContent>
            <DialogContentText>
              ¿Estás seguro de que deseas eliminar este proyecto? Esta acción no se puede deshacer.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)} color="primary">
              Cancelar
            </Button>
            <Button onClick={handleDeleteConfirm} color="error" autoFocus>
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  };

  export default ProjectList;
