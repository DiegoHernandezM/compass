import { useEffect, useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Stack,
  Typography,
  LinearProgress,
  Alert,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Backdrop
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

export default function PersonalReportsIndex() {
  const { props } = usePage();
  const latest = usePage().props.latest ?? [];
  const successMessage = props?.flash?.success ?? null;
  const [showSuccess, setShowSuccess] = useState(!!successMessage);
  const [uploading, setUploading] = useState(false);
  const [textFilter, setTextFilter] = useState('');
  const [ageFilter, setAgeFilter] = useState('all'); // '1w' | '2w' | '3w' | '1m' | 'gt1m' | 'all'
  const parseDate = (v) => (v ? new Date(v) : null);

  const [openDescDialog, setOpenDescDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('Detalle');
  const [dialogText, setDialogText] = useState('');

  const [loading, setLoading] = useState(false);

  const handleCellDoubleClick = (params) => {
    console.log(params);
    // Solo abrir para la columna "description" (ajusta el field si usas otro nombre)
    if (params.field !== 'description') return;

    const value = params?.row?.description ?? '';
    if (!value) return;

    setDialogTitle(`Ticket ${params?.row?.ticket_number ?? ''}`);
    setDialogText(value);
    setOpenDescDialog(true);
  };


  const { data, setData, post, reset, errors, progress } = useForm({
    file: null,
  });

  useEffect(() => {
    if (successMessage) setShowSuccess(true);
  }, [successMessage]);

  const handleFileChange = (e) => {
    setData('file', e.target.files[0] ?? null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!data.file) return;

    setUploading(true);
    setLoading(true);
    post(route('personal-reports.import'), {
      forceFormData: true,
      onFinish: () => {
        setUploading(false);
        reset('file');
        setLoading(false);
      },
    });
  };

  const isInAgeRange = (openedAt, key) => {
    console.log('entrox');
    if (key === 'all') return true;
    if (!openedAt) return false;

    const now = new Date();
    const msInDay = 24 * 60 * 60 * 1000;
    const diffDays = Math.floor((now - openedAt) / msInDay);

    switch (key) {
      case '1w':   return diffDays <= 7;
      case '2w':   return diffDays > 7  && diffDays <= 14;
      case '3w':   return diffDays > 14 && diffDays <= 21;
      case '1m':   return diffDays > 21 && diffDays <= 31;
      case 'gt1m': return diffDays > 31;
      default:     return true;
    }
  };

  const filteredRows = useMemo(() => {
    const q = textFilter.trim().toLowerCase();
    return (latest ?? []).filter((r) => {
      const opened = parseDate(r?.opened_at);
      const matchAge = isInAgeRange(opened, ageFilter);

      const hayTexto =
        !q ||
        String(r?.ticket_number ?? '').toLowerCase().includes(q) ||
        String(r?.client ?? '').toLowerCase().includes(q) ||
        String(r?.unit ?? '').toLowerCase().includes(q) ||
        String(r?.assignee ?? '').toLowerCase().includes(q);

      return matchAge && hayTexto;
    });
  }, [latest, textFilter, ageFilter]);

  const fmt = (v) => {
    if (!v) return '';
    const d = parseDate(v);
    return d ? d.toLocaleString() : '';
    // si prefieres fecha corta:
    // return d ? d.toLocaleDateString() + ' ' + d.toLocaleTimeString() : '';
  };

  const handleDownload = async () => {
    setLoading(true);
    try {
      const res = await fetch(route('personal-reports.export-dashboard'));
      if (!res.ok) {
        const text = await res.text(); // intenta leer lo que mandó el server
        throw new Error(text || `HTTP ${res.status}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard_tickets_${new Date().toISOString()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Hubo un error al descargar el archivo');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };


  const columns = [
    { field: 'ticket_number', headerName: 'Ticket', flex: 0.8, minWidth: 120,
      renderCell: (params) => <Box>{params.row?.ticket_number ?? ''}</Box>
    },
    { field: 'opened_at', headerName: 'F. de alta', flex: 1, minWidth: 160,
      renderCell: (params) => <Box>{fmt(params.row?.opened_at)}</Box>
    },
    { field: 'count', headerName: 'No. de registros', flex: 0.8, minWidth: 120,
      renderCell: (p) => <Box>{p.row?.count ?? ''}</Box>
    },
    { field: 'assignee', headerName: 'Asignado', flex: 1.2, minWidth: 160,
      renderCell: (p) => <Box>{p.row?.assignee ?? ''}</Box>
    },
    { field: 'client', headerName: 'Cliente', flex: 1, minWidth: 140,
      renderCell: (p) => <Box>{p.row?.client ?? ''}</Box>
    },
    { field: 'unit', headerName: 'Unidad', flex: 1, minWidth: 140,
      renderCell: (p) => <Box>{p.row?.unit ?? ''}</Box>
    },
    { field: 'contact', headerName: 'Contacto', flex: 1, minWidth: 160,
      renderCell: (p) => <Box>{p.row?.contact ?? ''}</Box>
    },
    { field: 'description', headerName: 'Descripción', flex: 1.6, minWidth: 220,
      renderCell: (p) => (
        <Box
          sx={{
            width: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            cursor: (p.row?.description ? 'zoom-in' : 'default')
          }}
          title="Doble clic para ver completo"
        >
          {p.row?.description ?? ''}
        </Box>
      )
    },
  ];

  return (
    <AuthenticatedLayout
      header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Importar reporte de tickets</h2>}
    >
      <Head title="Personal Reports" />

      <Box p={3}>

        {/* Mensajes */}
        <Stack spacing={2} sx={{ mb: 2 }}>
          {showSuccess && (
            <Alert severity="success" onClose={() => setShowSuccess(false)}>
              {successMessage}
            </Alert>
          )}
          {errors.file && (
            <Alert severity="error">{errors.file}</Alert>
          )}
        </Stack>
        <Backdrop
          open={loading}
          sx={{
            color: '#fff',
            zIndex: (theme) => theme.zIndex.modal + 1, // encima de modales
          }}
        >
          <CircularProgress color="inherit" />
        </Backdrop>

        {/* Card de importación */}
        <Card sx={{ mb: 3 }}>
          <CardHeader title="Subir archivo Excel" subheader="Formatos permitidos: .xlsx, .xls, .csv" />
          <CardContent>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!data.file || uploading}
                >
                  {uploading ? 'Importando...' : 'Importar'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleDownload}
                  disabled={loading}
                  startIcon={loading && <CircularProgress size={20} />}
                >
                  {loading ? "Descargando..." : "Descargar dashboard Excel"}
                </Button>
              </Stack>

              {(progress || uploading) && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption">Progreso</Typography>
                  <LinearProgress variant="determinate" value={progress?.percentage ?? 100} />
                </Box>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Últimos registros */}
        <Card>
          <CardHeader title="Últimos registros importados" />
          <CardContent>
            <Box display="flex" gap={2} mb={2} alignItems="center" flexWrap="wrap">
              <TextField
                size="small"
                label="Buscar (ticket / cliente / unidad / asignado)"
                value={textFilter}
                onChange={(e) => setTextFilter(e.target.value)}
                sx={{ minWidth: 360 }}
              />

              <FormControl size="small" sx={{ minWidth: 240 }}>
                <InputLabel id="age-filter-label">Creado</InputLabel>
                <Select
                  labelId="age-filter-label"
                  label="Creado"
                  value={ageFilter}
                  onChange={(e) => setAgeFilter(e.target.value)}
                >
                  <MenuItem value="all">Todos</MenuItem>
                  <MenuItem value="1w">Creado hace 1 semana</MenuItem>
                  <MenuItem value="2w">Creado hace 2 semanas</MenuItem>
                  <MenuItem value="3w">Creado hace 3 semanas</MenuItem>
                  <MenuItem value="1m">Creado hace 1 mes</MenuItem>
                  <MenuItem value="gt1m">Creado hace más de 1 mes</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <DataGrid
              rows={filteredRows}
              columns={columns}
              getRowId={(r) => r?.id ?? `${r.ticket_number}-${r.opened_at}-${Math.random()}`}
              pageSize={10}
              rowsPerPageOptions={[5,10,20]}
              disableSelectionOnClick
              autoHeight
              onCellDoubleClick={handleCellDoubleClick}
            />
          </CardContent>
          <Dialog open={openDescDialog} onClose={() => setOpenDescDialog(false)} maxWidth="md" fullWidth>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogContent dividers>
              <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                {dialogText}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDescDialog(false)} variant="contained">Cerrar</Button>
            </DialogActions>
          </Dialog>
        </Card>

      </Box>
    </AuthenticatedLayout>
  );
}
