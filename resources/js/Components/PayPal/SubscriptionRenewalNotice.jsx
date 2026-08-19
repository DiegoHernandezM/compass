import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import PayPalComponent from './PayPalComponent';

export default function SubscriptionRenewalNotice({ subscription, user, clientId }) {
  const [open, setOpen] = useState(false);

  if (!subscription || (!subscription.expired && !subscription.expiringSoon)) {
    return null;
  }

  const expirationDate = subscription.expiresAt
    ? new Intl.DateTimeFormat('es-MX', { dateStyle: 'long' }).format(new Date(subscription.expiresAt))
    : null;

  return (
    <>
      <Alert
        severity={subscription.expired ? 'error' : 'warning'}
        sx={{ mb: 3, alignItems: 'center' }}
        action={(
          <Button color="inherit" variant="outlined" onClick={() => setOpen(true)}>
            Renovar con PayPal
          </Button>
        )}
      >
        <Typography sx={{ fontWeight: 700 }}>
          {subscription.expired
            ? 'Tu suscripción ha expirado.'
            : `Tu suscripción vence en ${subscription.daysRemaining} ${subscription.daysRemaining === 1 ? 'día' : 'días'}.`}
        </Typography>
        <Typography variant="body2">
          {subscription.expired
            ? 'Renueva tu suscripción para recuperar el acceso a la plataforma.'
            : `Tu acceso vence el ${expirationDate}. Renueva ahora sin perder los días restantes.`}
        </Typography>
      </Alert>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Renovar suscripción con PayPal</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ px: { xs: 0, sm: 2 } }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Completa el pago para mantener activo tu acceso a exámenes y resultados.
            </Typography>
            <PayPalComponent user={user} clientId={clientId} isRenovation />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
