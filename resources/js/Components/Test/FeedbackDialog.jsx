import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function FeedbackDialog({open, close, message, image}) {
  return (
    <React.Fragment>
      <Dialog
        open={open}
        slots={{
          transition: Transition,
        }}
        keepMounted
        onClose={close}
        aria-describedby="alert-dialog-slide-description"
        PaperProps={{
            sx: {
            borderRadius: 4, // cambia el valor según qué tan redondeado lo quieras
            },
        }}
      >
        <DialogTitle>{"Explicación"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            {message}
            {image && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  margin: '20px 0',
                }}
              >
                <img
                  src={image}
                  alt="feedback image"
                  style={{ height: 300, width: 'auto' }}
                />
              </div>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={close}>Cerrar</Button> 
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}