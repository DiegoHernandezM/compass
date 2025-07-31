import * as React from 'react';
import {
  Button,
  Dialog,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Slide,
  Box,
  Stack,
  Tooltip
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function QuestionsDialog({ open, close, questions, type }) {
  const columns = [
    {
      field: 'question',
      headerName: 'Pregunta',
      flex: 0.9,
      sortable: true,
      renderCell: (params) => (
        <Tooltip title={params.row.question} arrow>
          {params.row.question ?? params.row.question_image}
        </Tooltip>
      ),
    },
    { field: 'answer_a', headerName: 'Opción A', flex: 0.5 },
    { field: 'answer_b', headerName: 'Opción B', flex: 0.5 },
    { field: 'answer_c', headerName: 'Opción C', flex: 0.5 },
    { field: 'answer_d', headerName: 'Opción D', flex: 0.5 },
    { field: 'correct_answer', headerName: 'Respuesta', flex: 0.5 },
    { field: 'feedback_text', headerName: 'Feedback', flex: 0.5 },
    {
      field: 'actions',
      headerName: 'Acciones',
      flex: 0.5,
      sortable: true,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="Niveles" arrow>
            <IconButton onClick={() => handleSowLevels(params.row)} color="primary">
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];
  return (
    <React.Fragment>
      <Dialog
        fullScreen
        open={open}
        onClose={close}
        slots={{
          transition: Transition,
        }}
      >
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={close}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              {type?.name}
            </Typography>
            <Button autoFocus color="inherit" onClick={close}>
              CERRAR
            </Button>
          </Toolbar>
        </AppBar>
        <Box p={4}>
          <Box sx={{ height: 500, width: '100%' }}>
            <DataGrid
              rows={questions}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[5, 10, 20]}
              disableSelectionOnClick
              autoHeight
            />
          </Box>
        </Box>
      </Dialog>
    </React.Fragment>
  );
}
