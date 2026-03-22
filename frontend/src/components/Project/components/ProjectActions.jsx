import React, { useState } from 'react';
import {
  IconButton,
  Tooltip,
  Stack,
  Fade,
  ButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  MoreVert as MoreIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledIconButton = styled(IconButton)(({ theme, color = 'primary' }) => ({
  backgroundColor: theme.palette[color].light,
  color: theme.palette[color].main,
  '&:hover': {
    backgroundColor: theme.palette[color].main,
    color: theme.palette[color].contrastText,
  },
  transition: 'all 0.2s ease-in-out',
  margin: theme.spacing(0, 0.5),
  padding: theme.spacing(1),
}));

const ProjectActions = ({ onEdit, onDelete, onView }) => {
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  const handleDeleteClick = () => {
    setOpenConfirmDialog(true);
  };

  const handleConfirmDelete = () => {
    onDelete();
    setOpenConfirmDialog(false);
  };

  return (
    <>
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Tooltip 
          title="Ver detalles" 
          arrow 
          TransitionComponent={Fade} 
          placement="top"
        >
          <StyledIconButton
            size="small"
            onClick={onView}
            color="info"
          >
            <ViewIcon fontSize="small" />
          </StyledIconButton>
        </Tooltip>

        <Tooltip 
          title="Editar proyecto" 
          arrow 
          TransitionComponent={Fade} 
          placement="top"
        >
          <StyledIconButton
            size="small"
            onClick={onEdit}
            color="primary"
          >
            <EditIcon fontSize="small" />
          </StyledIconButton>
        </Tooltip>

        <Tooltip 
          title="Eliminar proyecto" 
          arrow 
          TransitionComponent={Fade} 
          placement="top"
        >
          <StyledIconButton
            size="small"
            onClick={handleDeleteClick}
            color="error"
          >
            <DeleteIcon fontSize="small" />
          </StyledIconButton>
        </Tooltip>
      </Stack>

      <Dialog open={openConfirmDialog} onClose={() => setOpenConfirmDialog(false)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro de que desea eliminar este proyecto? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmDialog(false)}>Cancelar</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProjectActions; 