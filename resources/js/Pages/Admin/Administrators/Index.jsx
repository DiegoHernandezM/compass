import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { Box, Button, Stack } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import { Inertia } from '@inertiajs/inertia';
import AdminForm from '../../../Components/Forms/AdminForm';

import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

export default function Administrators() {
  const { administrators } = usePage().props;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const successMessage = usePage().props?.flash?.success ?? null;
  const [open, setOpen] = useState(!!successMessage);

  useEffect(() => {
    if (successMessage) {
      setOpen(true);
    }
  }, [successMessage]);

  const handleEdit = (admin) => {
    setSelectedAdmin(admin);
    setDrawerOpen(true);
  };

  const handleCreate = () => {
    setSelectedAdmin(null);
    setDrawerOpen(true);
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'name', headerName: 'Nombre', flex: 1 },
    { field: 'email', headerName: 'Correo', flex: 1 },
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
    if (confirm('¿Estás seguro de eliminar este administrador?')) {
      console.log('Eliminar administrador con ID:', id);
      Inertia.delete(route('admins.destroy', id));
    }
  };

  return (
    <AuthenticatedLayout
      header={
        <h2 className="text-xl font-semibold leading-tight text-gray-800">
          Administradores
        </h2>
      }
    >
      <Head title="Administradores" />
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
            Crear nuevo administrador
          </Button>
        </Box>

        <Box sx={{ height: 500, width: '100%' }}>
          <DataGrid
            rows={administrators}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[5, 10, 20]}
            disableSelectionOnClick
            autoHeight
          />
        </Box>
      </Box>
      <AdminForm open={drawerOpen} onClose={() => setDrawerOpen(false)} admin={selectedAdmin} />
    </AuthenticatedLayout>
  );
}
