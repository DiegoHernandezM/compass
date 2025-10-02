import React, { useState, useEffect, useMemo } from 'react';
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
  MenuItem,
  Stack,
  FormHelperText
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Inertia } from '@inertiajs/inertia';

const isUrl = (v) => {
  if (typeof v !== 'string') return false;
  const s = v.trim();
  if (!s) return false;
  // Acepta http/https, s3, data URL de imagen y rutas absolutas típicas
  return /^(https?:\/\/|s3:\/\/|data:image\/|\/[^\/].*\.(png|jpe?g|gif|webp|svg)(\?.*)?$)/i.test(s)
      || /^https?:\/\/.+\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(s);
};

export default function QuestionForm({ open, onClose, question = null }) {
  // --- Flags por campo basados en si el valor actual ES URL ---
  const aIsImage = useMemo(() => isUrl(question?.answer_a), [question]);
  const bIsImage = useMemo(() => isUrl(question?.answer_b), [question]);
  const cIsImage = useMemo(() => isUrl(question?.answer_c), [question]);
  const dIsImage = useMemo(() => isUrl(question?.answer_d), [question]);

  // Para la pregunta: si trae URL en question_image, es imagen; si no, texto.
  const qIsImage = useMemo(() => isUrl(question?.question_image), [question]);

  const [form, setForm] = useState({
    question: '',
    question_image: null,
    answer_a: '',
    answer_b: '',
    answer_c: '',
    answer_d: '',
    correct_answer: '',
    feedback_text: '',
    feedback_image: null,
    has_dynamic: false,
  });

  const [preview, setPreview] = useState({
    question_image: null,
    answer_a: null,
    answer_b: null,
    answer_c: null,
    answer_d: null,
    feedback_image: null,
  });

  useEffect(() => {
    setForm({
      question: qIsImage ? '' : (question?.question || ''),
      question_image: null,
      answer_a: question?.answer_a ?? '',
      answer_b: question?.answer_b ?? '',
      answer_c: question?.answer_c ?? '',
      answer_d: question?.answer_d ?? '',
      correct_answer: question?.correct_answer || '',
      feedback_text: question?.feedback_text || '',
      feedback_image: null,
      has_dynamic: Boolean(question?.has_dynamic) || false,
    });

    setPreview({
      question_image: qIsImage ? (question?.question_image || null) : null,
      answer_a: aIsImage ? question?.answer_a || null : null,
      answer_b: bIsImage ? question?.answer_b || null : null,
      answer_c: cIsImage ? question?.answer_c || null : null,
      answer_d: dIsImage ? question?.answer_d || null : null,
      feedback_image: null,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question]);

  const handleChange = (e) => {
    const { name, type, files, value } = e.target;
    if (type === 'file') {
      const file = files?.[0] || null;
      setForm((prev) => ({ ...prev, [name]: file }));
      if (file) {
        const url = URL.createObjectURL(file);
        setPreview((p) => ({ ...p, [name]: url }));
      } else {
        setPreview((p) => ({ ...p, [name]: null }));
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form };
    Inertia.post(
      route('question.update', question.id),
      { ...payload, _method: 'PUT' },
      { forceFormData: true }
    );
    onClose();
  };

  const ImageField = ({ label, name, existingUrl }) => (
    <Box mt={2}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>{label} (Imagen)</Typography>
      {(preview[name] || existingUrl) && (
        <Box sx={{ mb: 1, border: '1px solid', borderColor: 'divider', p: 1, borderRadius: 1 }}>
          <img
            src={preview[name] || existingUrl}
            alt={`${label} actual`}
            style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain', display: 'block', margin: '0 auto' }}
          />
          <FormHelperText sx={{ textAlign: 'center' }}>Vista previa</FormHelperText>
        </Box>
      )}
      <Button variant="outlined" component="label" fullWidth>
        {(preview[name] || existingUrl) ? 'Reemplazar imagen' : 'Subir imagen'}
        <input type="file" name={name} accept="image/*" hidden onChange={handleChange} />
      </Button>
    </Box>
  );

  const TextFieldSimple = ({ label, name, required = true }) => (
    <TextField
      label={label}
      name={name}
      fullWidth
      value={form[name] || ''}
      onChange={handleChange}
      margin="normal"
      required={required}
      style={{ marginTop: "10px" }}
    />
  );

  // Render según URL o texto
  const renderAnswer = (keyLabel, keyName, isImage, existingUrl) => {
    return isImage
      ? <ImageField key={keyName} label={keyLabel} name={keyName} existingUrl={existingUrl} />
      : <TextFieldSimple key={keyName} label={keyLabel} name={keyName} />;
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1000 }}
    >
      <Box sx={{ width: 440, p: 3 }} role="presentation">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {question ? 'Editar Pregunta' : 'Nueva Pregunta'}
          </Typography>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Box>

        <Box component="form" onSubmit={handleSubmit} mt={2}>
          {/* Pregunta */}
          {qIsImage ? (
            <ImageField
              label="Pregunta"
              name="question_image"
              existingUrl={question?.question_image || null}
            />
          ) : (
            <TextFieldSimple label="Pregunta" name="question" />
          )}

          <Stack spacing={1}>
            {renderAnswer('Respuesta A', 'answer_a', aIsImage, aIsImage ? question?.answer_a : null)}
            {renderAnswer('Respuesta B', 'answer_b', bIsImage, bIsImage ? question?.answer_b : null)}
            {renderAnswer('Respuesta C', 'answer_c', cIsImage, cIsImage ? question?.answer_c : null)}
            {renderAnswer('Respuesta D', 'answer_d', dIsImage, dIsImage ? question?.answer_d : null)}
          </Stack>

          <FormControl fullWidth margin="normal" required>
            <InputLabel id="correct-answer-label">Respuesta Correcta</InputLabel>
            <Select
              labelId="correct-answer-label"
              name="correct_answer"
              value={form.correct_answer}
              label="Respuesta Correcta"
              onChange={handleChange}
              MenuProps={{ container: document.body, disablePortal: true }}
            >
              <MenuItem value="A">A</MenuItem>
              <MenuItem value="B">B</MenuItem>
              <MenuItem value="C">C</MenuItem>
              <MenuItem value="D">D</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Retroalimentación (texto)"
            name="feedback_text"
            fullWidth
            multiline
            rows={3}
            value={form.feedback_text}
            onChange={handleChange}
            margin="normal"
          />

          <Box mt={1}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Retroalimentación (imagen) — opcional</Typography>
            {preview.feedback_image && (
              <Box sx={{ mb: 1, border: '1px solid', borderColor: 'divider', p: 1, borderRadius: 1 }}>
                <img
                  src={preview.feedback_image}
                  alt="Feedback preview"
                  style={{ maxWidth: '100%', maxHeight: 160, objectFit: 'contain', display: 'block', margin: '0 auto' }}
                />
                <FormHelperText sx={{ textAlign: 'center' }}>Vista previa</FormHelperText>
              </Box>
            )}
            <Button variant="outlined" component="label" fullWidth>
              {preview.feedback_image ? 'Reemplazar imagen' : 'Subir imagen'}
              <input
                type="file"
                name="feedback_image"
                accept="image/*"
                hidden
                onChange={handleChange}
                style={{ marginBottom: '10px' }}
              />
            </Button>
          </Box>

          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 3 }}>
            Actualizar
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}
