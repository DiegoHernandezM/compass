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

export default function QuestionForm({ open, onClose, question = null }) {
  const [form, setForm] = useState({
    question: '',
    answer_a: '',
    answer_b: '',
    answer_c: '',
    answer_d: '',
    correct_answer: '',
    feedback_text: '',
    feedback_image: null,
  });

  useEffect(() => {
    setForm({
      question: question?.question || '',
      answer_a: question?.answer_a || '',
      answer_b: question?.answer_b || '',
      answer_c: question?.answer_c || '',
      answer_d: question?.answer_d || '',
      correct_answer: question?.correct_answer || '',
      feedback_text: question?.feedback_text || '',
      feedback_image: null,
      has_dynamic: question?.has_dynamic || false,
    }); 
  }, [question]);

  const handleChange = (e) => {
    const { name, type, files, value, checked } = e.target;
    const newValue = type === 'file' ? files[0] : type === 'checkbox' ? checked : value;
    setForm((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form };  
    Inertia.post(route('question.update', question.id), {
      ...payload,
      _method: 'PUT',
    }, { forceFormData: true });
    onClose();
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1000 }}>
      <Box sx={{ width: 400, p: 3 }} role="presentation">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {question ? 'Editar Pregunta' : 'Nueva Pregunta'}
          </Typography>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Box>

        <Box component="form" onSubmit={handleSubmit} mt={2}>
          <TextField label="Pregunta" name="question" fullWidth value={form.question} onChange={handleChange} margin="normal" required />
          <TextField label="Respuesta A" name="answer_a" fullWidth value={form.answer_a} onChange={handleChange} margin="normal" required />
          <TextField label="Respuesta B" name="answer_b" fullWidth value={form.answer_b} onChange={handleChange} margin="normal" required />
          <TextField label="Respuesta C" name="answer_c" fullWidth value={form.answer_c} onChange={handleChange} margin="normal" required />
          <TextField label="Respuesta D" name="answer_d" fullWidth value={form.answer_d} onChange={handleChange} margin="normal" />
          <FormControl fullWidth margin="normal" required>
            <InputLabel id="correct-answer-label">Respuesta Correcta</InputLabel>
            <Select
              labelId="correct-answer-label"
              name="correct_answer"
              value={form.correct_answer}
              label="Respuesta Correcta"
              onChange={handleChange}
              MenuProps={{
                container: document.body,
                disablePortal: true,
              }}
            >
              <MenuItem value="A">A</MenuItem>
              <MenuItem value="B">B</MenuItem>
              <MenuItem value="C">C</MenuItem>
              <MenuItem value="D">D</MenuItem>
            </Select>
          </FormControl>
          <TextField label="Retroalimentación" name="feedback_text" fullWidth multiline rows={3} value={form.feedback_text} onChange={handleChange} margin="normal" />
          <input type="file" name="feedback_image" onChange={handleChange} style={{ marginTop: 16 }} />
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
             Actualizar
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}
