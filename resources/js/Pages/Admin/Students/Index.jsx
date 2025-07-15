import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { Box, Button, Stack, TextField, Tooltip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import { Inertia } from '@inertiajs/inertia';
import StudentForm from '@/Components/Forms/StudentForm';
import SuccessAlert from '../../../Components/SuccessAlert';
import ValidationErrorAlert from '@/Components/ValidationErrorAlert';

export default function Students() {
  const { errors, flash } = usePage().props;
  const { students } = usePage().props;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const successMessage = usePage().props?.flash?.success ?? null;
  const [openSuccess, setOpenSuccess] = useState(!!successMessage);
  const [openError, setOpenError] = useState(false);
  const [searchText, setSearchText] = useState('');

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

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchText.toLowerCase()) ||
    student.user?.email?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      field: 'name',
      headerName: 'Nombre',
      flex: 1,
    },
    {
      field: 'user_email',
      headerName: 'Correo',
      flex: 1.5,
      renderCell: (params) => (params?.row?.user?.email || ''),
    },
    { field: 'gender', headerName: 'Género', flex: 1 },
    { field: 'phone', headerName: 'Teléfono', flex: 1 },
    { field: 'city', headerName: 'Ciudad', flex: 1 },
    { field: 'school', headerName: 'Escuela', flex: 1 },
    {
      field: 'user_expires_at',
      headerName: 'Fecha Expiración',
      flex: 1,
      renderCell: (params) => {
        const expiresAt = params?.row?.user?.paypal_user?.expires_at;
        return expiresAt ? expiresAt.substring(0, 10) : '';
      }
    },
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

        <Box sx={{ height: 600, width: '100%' }}>
          <Box display="flex" justifyContent="space-between" mb={2}>
            <TextField
              label="Buscar por nombre o correo"
              variant="outlined"
              size="small"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              sx={{ width: 300 }}
            />

            <Button
              variant="contained"
              color="primary"
              onClick={handleCreate}
            >
              Crear nuevo estudiante
            </Button>
          </Box>
          <DataGrid
            rows={filteredStudents}
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
