import StudentLayout from '@/Layouts/StudentLayout';
import { Head, usePage } from '@inertiajs/react';
import Memory from './Partials/Memory';
import Multitask from './Partials/Multitask';
import NormalTest from './Partials/NormalTest';
import { Box,Typography } from '@mui/material';

export default function Index() {
  const { test, subject } = usePage().props;
  const renderTestComponent = () => {
  const type = test?.subject?.question_type;

  if (type === 'MEMORIA A CORTO PLAZO - MEMORAMA') {
    return <Memory subject={subject} test={test} />;
  }

  if (type === 'MULTITASKING') {
    return <Multitask subject={subject} test={test} />;
  }

  if (type === 'ATPL' || type === 'MATEMATICAS' || type === 'RAZONAMIENTO LOGICO') {
    return <NormalTest subject={subject} test={test} />;
  }

  return (
    <Typography variant="h6" color="error">
      Tipo de test no soportado: {type}
    </Typography>
  );
};
  return (
    <StudentLayout>
      <Head title="Test - Estudiante" />
      <Box sx={{ minHeight: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.05)', p: 2 }}>
        {renderTestComponent()}
      </Box>
    </StudentLayout>
  );
}
