import React from 'react';
import { Snackbar, Alert, List, ListItem, ListItemText } from '@mui/material';

export default function ValidationErrorAlert({ open, onClose, errors }) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert onClose={onClose} severity="error" sx={{ width: '100%' }}>
        <List dense>
          {Object.entries(errors).map(([field, message], index) => (
            <ListItem key={index} disableGutters>
              <ListItemText primary={message} />
            </ListItem>
          ))}
        </List>
      </Alert>
    </Snackbar>
  );
}
