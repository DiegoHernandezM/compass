// utils
import { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import axios from 'axios';
import { Inertia } from '@inertiajs/inertia';
// material
import { Box, Button, Stack, Tooltip, CircularProgress, Backdrop } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
// imports
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import QuestionForm from '@/Components/Forms/QuestionForm';
import QuestionMultipleForm from '@/Components/Forms/QuestionMultipleForm';
import QuestionNewDialog from '@/Components/Dialog/QuestionsNewDialog';
import ImportQuestionDialog from '@/Components/Dialog/ImportQuestionDialog';
import LevelsDialog from '@/Components/Dialog/LevelsDialog';
import SuccessAlert from '@/Components/SuccessAlert';
import ValidationErrorAlert from '@/Components/ValidationErrorAlert';
import QuestionsDialog from '@/Components/Dialog/QuestionsDialog';
import TypeForm from '@/Components/Forms/TypeForm';

export default function Questions() {
  const { errors, flash } = usePage().props;
  const { subjects, types } = usePage().props;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newsQuestions, setNewsQuestions] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const successMessage = usePage().props?.flash?.success ?? null;
  const [openSuccess, setOpenSuccess] = useState(!!successMessage);
  const [openError, setOpenError] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [openQuestionsDialog, setOpenQuestionsDialog] = useState(false);
  const [openEditTypeDialog, setOpenEditTypeDialog] = useState(false);
  const [typeForm, setTypeForm] = useState(null);
  const [loading, setLoading] = useState(false);

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

  const handleEdit = (type) => {
    setSelectedType(type);
    setNewsQuestions(true);
  };

  const handleEditQuestion = (question, type) => {
    setSelectedQuestion(question);
    setDrawerOpen(true);
    type == 'MULTITASKING' ? setTypeForm('MULTITASKING') : setTypeForm('SINGLE');
  }

  const handleSowLevels = (subject) => {
    setSelectedType(subject);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDrawerOpen(false);
    setSelectedQuestion(null);
    setSelectedSubject(null);
  };

  const handleCloseNewDialog = () => {
    setNewsQuestions(false);
    setSelectedQuestion(null);
    setSelectedSubject(null);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedQuestion(null);
    setSelectedSubject(null);
  };

  const handleOpenImport = () => {
    setImportOpen(true);
  };

  const handleExport = (typeId, levelId) => {
    setLoading(true);

    Inertia.get(
      route('question.export', { typeId, levelId }),
      {},
      {
        onFinish: () => setLoading(false), 
        onError: () => setLoading(false), 
      }
    );
  };

  const handleEditType = (type) => {
    setSelectedType(type);
    setOpenEditTypeDialog(true);
  };

  const columns = [
    { field: 'name', headerName: 'Tipo de cuestionario', flex: 0.5 },
    { field: 'description', headerName: 'Descripción', flex: 0.5 },
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
          <Tooltip title="Asignar a Materias" arrow>
            <IconButton onClick={() => handleEdit(params.row)} color="primary">
              <AddIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Asignar a Materias" arrow>
            <IconButton onClick={() => handleEditType(params.row)} color="primary">
              <EditIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  const handleDelete = (id) => {
    if (confirm('¿Estás seguro de eliminar esta pregunta?')) {
      Inertia.delete(route('question.destroy', id));
    }
  };

  const hancleSaveQuestionSubject = (formData) => {
    setLoading(true);
    Inertia.post(route('question.test'), formData, {
      forceFormData: true,
      onFinish: () => {
        console.log('termino de guardar');
        setLoading(false);
      },
    });
  };

  const handleSowQuestions = async (level) => {
    try {
      setLoading(true);
      const response = await axios.get(route('question.show', {
        typeId: selectedType?.id,
        levelId: level?.id,
      }));
      if (response.data.questions) {
        setQuestions(response.data.questions);
        setOpenQuestionsDialog(true);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error al obtener preguntas:', error);
    }
  };

  const handleUpdateType = (formData) => {
    Inertia.put(route('type.update', formData.type_id), formData);
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
            onClick={handleOpenImport}
          >
            Importar Cuestionario
          </Button>
        </Box>

        <Box sx={{ height: 500, width: '100%' }}>
          <DataGrid
            rows={types}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[5, 10, 20]}
            disableSelectionOnClick
            autoHeight
          />
        </Box>
      </Box>
      <Backdrop
        open={loading}
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.modal + 1, // encima de modales
        }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      {typeForm == 'MULTITASKING' ? (
        <QuestionMultipleForm open={drawerOpen} onClose={handleClose} question={selectedQuestion}/>
      ) : (
        <QuestionForm open={drawerOpen} onClose={handleClose} question={selectedQuestion} />
      )}
      <QuestionNewDialog
        open={newsQuestions}
        onClose={handleCloseNewDialog}
        subjects={subjects}
        type={selectedType}
        onSave={hancleSaveQuestionSubject}
      />
      <LevelsDialog open={dialogOpen} onClose={handleCloseDialog} type={selectedType} handleSowQuestions={handleSowQuestions} />
      <QuestionsDialog
        open={openQuestionsDialog}
        close={() => setOpenQuestionsDialog(false)}
        questions={questions}
        type={selectedType}
        handleEditQuestion={handleEditQuestion}
      />
      <ImportQuestionDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        types={types}
        onImport={(formData) => {
          setLoading(true);
          Inertia.post(route('question.import'), formData, {
            forceFormData: true,
            onFinish: () => {
              console.log('termino de guardar');
              setLoading(false);
            },
          });
        }}
        handleExport={handleExport}
      />
      <TypeForm open={openEditTypeDialog} onClose={() => setOpenEditTypeDialog(false)} type={selectedType} onSubmit={handleUpdateType} />
    </AuthenticatedLayout>
  );
}
