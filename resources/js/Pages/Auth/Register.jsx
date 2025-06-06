import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import React from 'react';
import { Alert, Stepper, Step, Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from "@mui/material";
//import { UserIcon, CreditCardIcon } from "@heroicons/react/24/outline";
import PersonIcon from '@mui/icons-material/Person';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PayPalComponent from "@/Components/PayPal/PayPalComponent.jsx";

export default function Register() {

  const [openDialog, setOpenDialog] = useState(false);
  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });

  const [activeStep, setActiveStep] = useState(0);
  const [isFirstStep, setIsFirstStep] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [errorMessage, setErrorMessage] = useState('')
  const [clientId, setClientId] = useState(null);
  const [user, setUser] = useState([]);
  const [userPassword, setUserPassword] = useState('');

  useEffect(() => {
    fetch('/paypal-client-id')
      .then(response => response.json())
      .then(data => {
        setClientId(data.client_id);
      })
      .catch(error => {
        console.error('Error fetching client ID:', error);
      });
  }, []);
  const handleNext = () => {
    if (activeStep === 0 && !isRegistered) {
      return;
    }
    setActiveStep((cur) => cur + 1);
  };

  const submit = (e) => {
    e.preventDefault();
    post(route('register'), {
      onSuccess: (response) => {
        setIsRegistered(true);
        setActiveStep(1);
        setUser(response.props.user);
        setUserPassword(response.props.password);
      },
      onFinish: () => {
        reset('name', 'email', 'password', 'password_confirmation');
      }
    });
  };


  const checkEmail = async (email) => {
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
      const response = await fetch('/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken
        },
        body: JSON.stringify({ email })
      });

      if (response.status === 200) {
        const data = await response.json();
        setIsRegistered(true);
        setOpenDialog(true);
        setUser(data.user);
      } else {
        console.log('Guardando usuario')
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
      return false;
    }
  };

  const closeDialog = () => {
    setOpenDialog(false);
  };

  const handleCancel = () => {
    setIsCancelled(true);
    setOpenDialog(false);
    setErrorMessage('El proceso fue cancelado, intentalo de nuevo.')
    setData({
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
    });
  };

  return (
    <GuestLayout>
      <Head title="Register" />
      <div className="w-full py-4 px-2 relative" style={{ top: '10px' }}>
        <div className="flex justify-center w-full overflow-x-auto">
          <Stepper activeStep={activeStep} alternativeLabel className="w-full max-w-md">
            <Step
              onClick={() => isFirstStep && setActiveStep(0)}
              className={isFirstStep ? 'cursor-pointer' : 'cursor-not-allowed'}
            >
              <div className="flex flex-col items-center">
                <PersonIcon
                  className={`h-6 w-6 ${isFirstStep ? 'text-blue-600' : 'text-gray-400'}`}
                />
                <Typography
                  className="mt-2 text-sm"
                  color={activeStep === 0 ? "blue-gray" : "gray"}
                >
                  Información
                </Typography>
              </div>
            </Step>

            <Step
              onClick={() => isRegistered && !isCancelled && setActiveStep(1)}
              className={isRegistered && !isCancelled ? 'cursor-pointer' : 'cursor-not-allowed'}
            >
              <div className="flex flex-col items-center">
                <CreditCardIcon
                  className={`h-6 w-6 ${isRegistered ? 'text-blue-600' : 'text-gray-400'}`}
                />
                <Typography
                  className="mt-2 text-sm"
                  color={activeStep === 1 ? "blue-gray" : "gray"}
                >
                  Pago
                </Typography>
              </div>
            </Step>
          </Stepper>
        </div>

        {activeStep === 0 && (
          <div className={"mt-2 py-2"}>
            <br />
            <form onSubmit={submit}>
              <div className="mt-4">
                <InputLabel htmlFor="email" value="Correo" />

                <TextInput
                  id="email"
                  type="email"
                  name="email"
                  value={data.email}
                  className="mt-1 block w-full"
                  autoComplete="username"
                  isFocused={true}
                  onBlur={(e) => {
                    checkEmail(e.target.value);
                  }}
                  onChange={(e) => {
                    setData('email', e.target.value);
                  }}
                  required
                />

                <InputError message={errors.email} className="mt-2" />
              </div>
              <br />
              <div>
                <InputLabel htmlFor="name" value="Nombre Completo" />

                <TextInput
                  id="name"
                  name="name"
                  value={data.name}
                  className="mt-1 block w-full"
                  autoComplete="name"
                  onChange={(e) => setData('name', e.target.value)}
                  required
                />

                <InputError message={errors.name} className="mt-2" />
              </div>
              <br />
              <div className="mt-4">
                <InputLabel htmlFor="password" value="Contraseña" />

                <TextInput
                  id="password"
                  type="password"
                  name="password"
                  value={data.password}
                  className="mt-1 block w-full"
                  autoComplete="new-password"
                  onChange={(e) => setData('password', e.target.value)}
                  required
                />

                <InputError message={errors.password} className="mt-2" />
              </div>
              <br />
              <div className="mt-4">
                <InputLabel htmlFor="password_confirmation" value="Confirmar Contraseña" />

                <TextInput
                  id="password_confirmation"
                  type="password"
                  name="password_confirmation"
                  value={data.password_confirmation}
                  className="mt-1 block w-full"
                  autoComplete="new-password"
                  onChange={(e) => setData('password_confirmation', e.target.value)}
                  required
                />

                <InputError message={errors.password_confirmation} className="mt-2" />
              </div>
              <br />
              <div className="flex items-center justify-end mt-4">
                <PrimaryButton className="ms-4" disabled={processing}>
                  Guardar
                </PrimaryButton>
              </div>
              {errorMessage && (
                <div className="mt-4 text-red-800 font-bold flex flex-col items-center">
                  <Alert className="font-bold w-full text-center mt-2" variant="filled" color="red">
                    {errorMessage}
                  </Alert>
                </div>
              )}
            </form>
          </div>
        )}

        {activeStep === 1 && (
          <div className="w-full py-8 px-2 relative">
            <div className="w-full py-8 px-2 relative" style={{ maxWidth: "750px", minHeight: "200px" }}>
              <br />
              <PayPalComponent user={user} clientId={clientId} password={userPassword} />
            </div>
          </div>
        )}
      </div>

      <Dialog open={openDialog} handler={closeDialog}>
        <DialogTitle>Usuario encontrado</DialogTitle>
        <DialogContent>
          El correo electrónico que ingresaste ya pertenece a un usuario existente. Por favor, continúa con el proceso de pago para acceder.
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCancel}
            variant="outlined"
            color="error"
            sx={{
              mr: 2,
              px: 3,
              py: 1,
              fontWeight: 500,
              textTransform: 'none',
              borderRadius: 2,
              '&:hover': {
                backgroundColor: '#ffe6e6',
                borderColor: '#d32f2f',
              },
            }}
          >
            Cancelar
          </Button>

          <Button
            onClick={() => {
              setIsRegistered(true);
              setIsCancelled(false);
              closeDialog();
              handleNext();
            }}
            variant="contained"
            color="primary"
            sx={{
              px: 3,
              py: 1,
              fontWeight: 500,
              textTransform: 'none',
              borderRadius: 2,
              boxShadow: 3,
              '&:hover': {
                backgroundColor: '#1565c0',
              },
            }}
          >
            Continuar
          </Button>
        </DialogActions>
      </Dialog>
    </GuestLayout>
  );
}
