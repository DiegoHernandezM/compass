import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { Box, Button, Stack } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import IconButton from '@mui/material/IconButton';
import { Inertia } from '@inertiajs/inertia';
import QuestionForm from '../../../Components/Forms/QuestionForm';
import QuestionDialog from '../../../Components/Dialog/QuestionsDialog';
import SuccessAlert from '../../../Components/SuccessAlert';
import ValidationErrorAlert from '@/Components/ValidationErrorAlert';

export default function Questions() {
  const { errors, flash } = usePage().props;
  const { questions, subjects } = usePage().props;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  
  const successMessage = usePage().props?.flash?.success ?? null;

  const [openSuccess, setOpenSuccess] = useState(!!successMessage);
  const [openError, setOpenError] = useState(false);


  useEffect(() => {
    if (successMessage) {
      setOpenSuccess(true);
    }
  }, [successMessage]);

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      setOpenError(true);
    }
  }, [errors]);

  const handleEdit = (subject) => {
    setSelectedSubject(subject);
    setDrawerOpen(true);
  };

  const handleEditQuestion = (question) => {
    setSelectedQuestion(question);
    setDrawerOpen(true);
  }

  const handleSowQuestions = (subject) => {
    setSelectedSubject(subject);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedQuestion(null);
    setDrawerOpen(true);
  };

  const handleClose = () => {
    setDrawerOpen(false);
    setSelectedQuestion(null);
    setSelectedSubject(null);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedQuestion(null);
    setSelectedSubject(null);
  };


  const columns = [
    { field: 'name', headerName: 'Materia', flex: 0.5 },
    { field: 'questions_count', headerName: 'Número de preguntas', flex: 0.5 },
    {
      field: 'actions',
      headerName: 'Acciones',
      flex: 0.5,
      sortable: true,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <IconButton onClick={() => handleSowQuestions(params.row)} color="primary">
            <VisibilityIcon />
          </IconButton>
          <IconButton onClick={() => handleEdit(params.row)} color="primary">
            <AddIcon />
          </IconButton>
        </Stack>
      ),
    },
  ];

  const handleDelete = (id) => {
    if (confirm('¿Estás seguro de eliminar esta pregunta?')) {
      Inertia.delete(route('question.destroy', id));
    }
  };

  return (
    <AuthenticatedLayout
      header={
        <h2 className="text-xl font-semibold leading-tight text-gray-800">
          Cuestionarios
        </h2>
      }
    >
      <Head title="Cuestionarios" />

      <SuccessAlert
        open={openSuccess}
        onClose={() => setOpenSuccess(false)}
        message={successMessage}
      />

      <ValidationErrorAlert
        open={openError}
        onClose={() => setOpenError(false)}
        errors={errors}
      />

      <Box p={4}>
        <Box display="flex" justifyContent="flex-end" mb={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreate}
          >
            Importar Cuestionario
          </Button>
        </Box>

        <Box sx={{ height: 500, width: '100%' }}>
          <DataGrid
            rows={subjects}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[5, 10, 20]}
            disableSelectionOnClick
            autoHeight
          />
        </Box>
      </Box>
      <QuestionForm open={drawerOpen} onClose={handleClose} question={selectedQuestion} subjectId={selectedSubject?.id} />
      <QuestionDialog open={dialogOpen} onClose={handleCloseDialog} subject={selectedSubject} handleEditQuestion={handleEditQuestion} handleDelete={handleDelete} />
      
    </AuthenticatedLayout>
  );
}
