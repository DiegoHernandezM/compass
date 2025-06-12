import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { Box, Button, Stack } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import { Inertia } from '@inertiajs/inertia';
import SubjectForm from '../../../Components/Forms/SubjectForm';
import SuccessAlert from '../../../Components/SuccessAlert';
import ValidationErrorAlert from '@/Components/ValidationErrorAlert';

export default function Subject() {
  const { errors, flash } = usePage().props;
  const { subjects } = usePage().props;
  const [drawerOpen, setDrawerOpen] = useState(false);
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

  const handleCreate = () => {
    setSelectedSubject(null);
    setDrawerOpen(true);
  };


  const columns = [
    { field: 'name', headerName: 'Nombre', flex: 1 },
    { field: 'description', headerName: 'Descripcion', flex: 1 },
    {
      field: 'color',
      headerName: 'Color',
      flex: 1,
      renderCell: (params) => (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
          }}
        >
          <div
            style={{
              width: 50,
              height: 50,
              backgroundColor: params.value,
              borderRadius: 4,
              border: '1px solid #ccc',
            }}
            title={params.value}
          />
        </div>
      ),
    },
    {
      field: 'image',
      headerName: 'Imagen',
      flex: 1,
      renderCell: (params) => {
        const imageUrl = `/storage/${params.row.image}`;
        return (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
            }}
          >
            <img
              src={imageUrl}
              alt="Imagen de materia"
              style={{
                width: 50,
                height: 50,
                objectFit: 'cover',
                borderRadius: 8,
              }}
            />
          </div>
        );
      }
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <IconButton onClick={() => handleEdit(params.row)} color="primary">
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

  const handleDelete = (id) => {
    if (confirm('¿Estás seguro de eliminar esta materia?')) {
      Inertia.delete(route('subject.destroy', id));
    }
  };

  return (
    <AuthenticatedLayout
      header={
        <h2 className="text-xl font-semibold leading-tight text-gray-800">
          Materias
        </h2>
      }
    >
      <Head title="Materias" />

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
            Crear nueva materia
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
      <SubjectForm open={drawerOpen} onClose={() => setDrawerOpen(false)} subject={selectedSubject} />
    </AuthenticatedLayout>
  );
}
