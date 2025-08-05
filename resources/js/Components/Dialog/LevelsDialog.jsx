import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tooltip,
  Box
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import IconButton from '@mui/material/IconButton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Stack from '@mui/material/Stack';

export default function LevelsDialog({ open, onClose, type, handleSowQuestions }) {
  const columns = [
    { field: 'name', headerName: 'Nivel', flex: 0.1 },
    { field: 'description', headerName: 'Descripción', flex: 0.5 },
    {
      field: 'actions',
      headerName: 'Acciones',
      flex: 0.2,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="Ver preguntas" arrow>
            <IconButton onClick={() => handleSowQuestions(params.row)} color="primary">
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Niveles de: {type?.name}</DialogTitle>
      <DialogContent>
        <Box sx={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={type?.levels}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            getRowId={(row) => row.id}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}
