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
import EditIcon from '@mui/icons-material/Edit';
import * as Icons from '@mui/icons-material';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function QuestionsDialog({ open, close, questions, type, handleEditQuestion }) {
  const isImage = (v) => {
    if (typeof v !== 'string') return false;
    const val = v.trim().toLowerCase();
    return (
      val.startsWith('data:image/') ||
      /\.(png|jpe?g|gif|svg|webp)$/.test(val)
    );
  };

  // Si guardas la key (ej: "spatial/questions/archivo.png"):
  const buildImageUrl = (v) => {
    if (!v) return '';
    if (v.startsWith('http') || v.startsWith('data:')) return v;
    // Ajusta esta base a tu URL pública de S3 o a tu route que sirve archivos
    return `${import.meta.env.VITE_S3_PUBLIC_URL}/${v}`;
  };
  const columnsMemory = [
    {
      field: 'name',
      headerName: 'Memorama',
      flex: 0.9,
      sortable: true,
      renderCell: (params) => {
        const IconComponent = Icons[params.row.name];
        return IconComponent ? (
          <IconComponent sx={{ fontSize: 40, color: '#555', mx: 'auto' }} />
        ) : (
          <span>{params.row.name}</span>
        );
      }
    },
  ];
  const columns = [
    {
      field: 'question',
      headerName: 'Pregunta',
      flex: 0.9,
      sortable: true,
      renderCell: (params) => (
        params.row.question ? (
          <Tooltip title={params.row.question} arrow>
            <span style={{ cursor: 'default' }}>{params.row.question}</span>
          </Tooltip>
        ) : (
          <Box
            component="img"
            src={params.row.question_image}
            alt="Pregunta"
            sx={{ width: 300, height: 'auto', objectFit: 'contain' }}
          />
        )
      ),
    },
    {
      field: 'answer_a',
      headerName: 'Opción A',
      flex: 0.9,
      sortable: true,
      renderCell: ({ row }) => {
        // Si viene 'question', mostrar texto (tu regla original)
        if (row.question) {
          const textVal = row.answer_a ?? row.option_a ?? '';
          return <span>{textVal || '-'}</span>;
        }

        // Si NO viene 'question', decidir por tipo de dato en answer_a/option_a
        const val = row.answer_a ?? row.option_a ?? '';
        if (!val) return <span>-</span>;

        return isImage(val) ? (
          <Box sx={{ width:'100%', display:'flex', justifyContent:'center', alignItems:'center' }}>
            <Box
              component="img"
              src={buildImageUrl(val)}
              alt="Respuesta A"
              sx={{ width: 25, height: 25, objectFit: 'contain' }}
            />
          </Box>
        ) : (
          <span>{val}</span>
        );
      }
    },
    {
      field: 'answer_b',
      headerName: 'Opción B',
      flex: 0.9,
      sortable: true,
      renderCell: ({ row }) => {
        if (row.question) {
          const textVal = row.answer_b ?? row.option_b ?? '';
          return <span>{textVal || '-'}</span>;
        }
        const val = row.answer_b ?? row.option_b ?? '';
        if (!val) return <span>-</span>;

        return isImage(val) ? (
          <Box sx={{ width:'100%', display:'flex', justifyContent:'center', alignItems:'center' }}>
            <Box
              component="img"
              src={buildImageUrl(val)}
              alt="Respuesta B"
              sx={{ width: 25, height: 25, objectFit: 'contain' }}
            />
          </Box>
        ) : (
          <span>{val}</span>
        );
      }
    },
    {
      field: 'answer_c',
      headerName: 'Opción C',
      flex: 0.9,
      sortable: true,
      renderCell: ({ row }) => {
        // Si viene 'question', mostrar texto (tu regla original)
        if (row.question) {
          const textVal = row.answer_c ?? row.option_c ?? '';
          return <span>{textVal || '-'}</span>;
        }

        // Si NO viene 'question', decidir por tipo de dato en answer_a/option_a
        const val = row.answer_c ?? row.option_c ?? '';
        if (!val) return <span>-</span>;

        return isImage(val) ? (
          <Box sx={{ width:'100%', display:'flex', justifyContent:'center', alignItems:'center' }}>
            <Box
              component="img"
              src={buildImageUrl(val)}
              alt="Respuesta C"
              sx={{ width: 25, height: 25, objectFit: 'contain' }}
            />
          </Box>
        ) : (
          <span>{val}</span>
        );
      }
    },
    {
      field: 'answer_d',
      headerName: 'Opción D',
      flex: 0.9,
      sortable: true,
      renderCell: ({ row }) => {
        // Si viene 'question', mostrar texto (tu regla original)
        if (row.question) {
          const textVal = row.answer_d ?? row.option_d ?? '';
          return <span>{textVal || '-'}</span>;
        }

        // Si NO viene 'question', decidir por tipo de dato en answer_a/option_a
        const val = row.answer_d ?? row.option_d ?? '';
        if (!val) return <span>-</span>;

        return isImage(val) ? (
          <Box sx={{ width:'100%', display:'flex', justifyContent:'center', alignItems:'center' }}>
            <Box
              component="img"
              src={buildImageUrl(val)}
              alt="Respuesta D"
              sx={{ width: 25, height: 25, objectFit: 'contain' }}
            />
          </Box>
        ) : (
          <span>{val}</span>
        );
      }
    },
    {
      field: 'correct_answer',
      headerName: 'Respuesta',
      flex: 0.9,
      sortable: true,
      renderCell: (params) =>
      (
        <span>{params.row.correct_answer ?? params.row.answer}</span>
      )
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      flex: 0.5,
      sortable: true,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="Editar" arrow>
            <IconButton onClick={() => handleEditQuestion(params.row, type?.name)} color="primary">
              <EditIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      )
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
              columns={type?.bypass_levels_and_questions != 1 ? columns : columnsMemory}
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
