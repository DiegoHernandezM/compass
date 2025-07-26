import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import axios from 'axios';

export default function QuestionsDialog({ open, onClose, subject, handleEditQuestion, handleDelete, handleExport }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQuestions = async () => {
    try {
      const response = await axios.get(route('question.subject', subject?.id));
      setQuestions(response.data);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && subject?.id) {
      fetchQuestions();
    }
  }, [open, subject?.id]);

  const columns = [
    { field: 'question', headerName: 'Pregunta', flex: 1 },
    {
      field: 'correct_answer',
      headerName: 'Correcta',
      width: 120,
      renderCell: (params) => (
        <span>{params.row.correct_answer || params.row.answer}</span>
      )
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <IconButton onClick={() => handleEditQuestion(params.row)} color="primary">
            <EditIcon />
          </IconButton>
          <IconButton
            onClick={() => handleDelete(params.row.id)}
            color="error"
            size="small"
          >
            <DeleteIcon />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Preguntas de la materia: {subject?.name}</DialogTitle>
      <DialogContent>
        {loading ? (
          <Typography>Cargando preguntas...</Typography>
        ) : (
          <Box sx={{ height: 400, width: '100%' }}>
            <DataGrid
              rows={questions}
              columns={columns}
              pageSize={5}
              rowsPerPageOptions={[5]}
              getRowId={(row) => row.id}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}
