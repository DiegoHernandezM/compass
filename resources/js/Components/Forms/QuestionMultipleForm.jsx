import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Inertia } from '@inertiajs/inertia';

export default function QuestionForm({ open, onClose, question = null, subjectId }) {
  console.log(question);
  const [form, setForm] = useState({
    subject_id: subjectId,
    question: '',
    option_a: '',
    option_b: '',
    option_c: '',
    answer: '',
  });

  useEffect(() => {
    if (subjectId) {
      setForm((prev) => ({ ...prev, subject_id: subjectId }));
    }
  }, [subjectId]);

  useEffect(() => {
    if (question) {
      setForm({
        subject_id: question.subject_id || subjectId || '',
        question: question.question || '',
        option_a: question.option_a || '',
        option_b: question.option_b || '',
        option_c: question.option_c || '',
        answer: question.answer || '',
      });
    } else {
      setForm({
        subject_id: subjectId || '',
        question: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        answer: '',
      });
    }
  }, [question, subjectId]);

  const handleChange = (e) => {
    const { name, type, files, value, checked } = e.target;
    const newValue = type === 'file' ? files[0] : type === 'checkbox' ? checked : value;
    setForm((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form };
    if (question) {
      Inertia.post(route('question.update', question.id), {
        ...payload,
        _method: 'PUT',
      }, { forceFormData: true });
    } else {
      Inertia.post(route('question.store'), payload, { forceFormData: true });
    }
    onClose();
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1000 }}>
      <Box sx={{ width: 400, p: 3 }} role="presentation">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Editar Pregunta
          </Typography>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Box>

        <Box component="form" onSubmit={handleSubmit} mt={2}>
          <TextField label="Pregunta" name="question" fullWidth value={form.question} onChange={handleChange} margin="normal" required />
          <TextField label="Respuesta A" name="option_a" fullWidth value={form.option_a} onChange={handleChange} margin="normal" required />
          <TextField label="Respuesta B" name="option_b" fullWidth value={form.option_b} onChange={handleChange} margin="normal" required />
          <TextField label="Respuesta C" name="option_c" fullWidth value={form.option_c} onChange={handleChange} margin="normal" required />
          <FormControl fullWidth margin="normal" required>
            <InputLabel id="correct-answer-label">Respuesta Correcta</InputLabel>
            {question?.type == 'figure' ? (
              <Select
                labelId="correct-answer-label"
                name="answer"
                value={form.answer}
                label="Respuesta Correcta"
                onChange={handleChange}
                MenuProps={{
                  container: document.body,
                  disablePortal: true,
                }}
              >
                <MenuItem value="x1">x1</MenuItem>
                <MenuItem value="x2">x2</MenuItem>
                <MenuItem value="x3">x3</MenuItem>
              </Select>
            ) : (
              <Select
                labelId="correct-answer-label"
                name="answer"
                value={form.answer}
                label="Respuesta Correcta"
                onChange={handleChange}
                MenuProps={{
                  container: document.body,
                  disablePortal: true,
                }}
              >
                <MenuItem value="Incorrecto">Incorrecto</MenuItem>
                <MenuItem value="Correcto">Correcto</MenuItem>
              </Select>
            )}
          </FormControl>
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
            Actualizar
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}
