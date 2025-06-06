import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { Box, Button, Stack, Snackbar, Alert, Tooltip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import { Inertia } from '@inertiajs/inertia';
import StudentForm from '@/Components/Forms/StudentForm';

export default function Students() {
  const { students } = usePage().props;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const successMessage = usePage().props?.flash?.success ?? null;
  const [open, setOpen] = useState(!!successMessage);

  useEffect(() => {
    if (successMessage) {
      setOpen(true);
    }
  }, [successMessage]);

  const handleEdit = (student) => {
    setSelectedStudent(student);
    setDrawerOpen(true);
  };

  const handleCreate = () => {
    setSelectedStudent(null);
    setDrawerOpen(true);
  };

  const handleDelete = (id) => {
    if (confirm('¿Estás seguro de eliminar este estudiante?')) {
      Inertia.delete(route('students.destroy', id));
    }
  };

  const handleRestore = (id) => {
    if (confirm('¿Estás seguro de recuperar este estudiante?')) {
      Inertia.put(route('students.restore', id));
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 40 },
    {
      field: 'name',
      headerName: 'Nombre',
      flex: 1,
    },
    {
      field: 'user',
      headerName: 'Correo',
      flex: 1.5,
      valueGetter: (params) => params?.email,
    },
    { field: 'birthdate', headerName: 'Fecha Nacimiento', flex: 1 },
    { field: 'gender', headerName: 'Género', flex: 1 },
    { field: 'phone', headerName: 'Teléfono', flex: 1 },
    { field: 'address', headerName: 'Direccion', flex: 1 },
    { field: 'zip_code', headerName: 'CP', flex: 1 },
    { field: 'city', headerName: 'Ciudad', flex: 1 },
    { field: 'country', headerName: 'País', flex: 1 },
    { field: 'school', headerName: 'Escuela', flex: 1 },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="Editar">
            <IconButton onClick={() => handleEdit(params.row)} color="primary">
              <EditIcon />
            </IconButton>
          </Tooltip>

          {params.row.deleted_at ? (
            <Tooltip title="Recuperar">
              <IconButton onClick={() => handleRestore(params.row.id)} color="success">
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="Eliminar">
              <IconButton onClick={() => handleDelete(params.row.id)} color="error">
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      ),
    },
  ];

  return (
    <AuthenticatedLayout
      header={
        <h2 className="text-xl font-semibold leading-tight text-gray-800">
          Estudiantes
        </h2>
      }
    >
      <Head title="Estudiantes" />

      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setOpen(false)} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>

      <Box p={4}>
        <Box display="flex" justifyContent="flex-end" mb={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreate}
          >
            Crear nuevo estudiante
          </Button>
        </Box>

        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={students}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[5, 10, 20]}
            disableSelectionOnClick
            getRowId={(row) => row.id}
            autoHeight
          />
        </Box>
      </Box>

      <StudentForm
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        student={selectedStudent}
      />
    </AuthenticatedLayout>
  );
}
