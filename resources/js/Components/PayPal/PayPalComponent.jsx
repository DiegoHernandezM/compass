import { useEffect, useState } from 'react';
import axios from 'axios';
import { PayPalScriptProvider, PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { Alert, CircularProgress } from "@mui/material";

export default function PayPalComponent({ user, clientId, password = "", isRenovation }) {
  const [successMessage, setSuccessMessage] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [content, setContent] = useState(null);
  const style = { "layout": "vertical" };
  let price = content?.subscription_price ?? 500;

  useEffect(() => {
      axios.get('/landing-content')
        .then(response => setContent(response.data))
        .catch(error => console.error('Error al obtener contenido:', error));
  }, []);


  const ButtonWrapper = ({ showSpinner }) => {
    const [{ isPending }] = usePayPalScriptReducer();

    return (
      <>
        {(showSpinner && isPending) && <div className="spinner" />}
        <PayPalButtons
          style={style}
          disabled={false}
          forceReRender={[style]}
          fundingSource={undefined}
          createOrder={(data, actions) => {
            return actions.order.create({
              purchase_units: [{
                amount: {
                  currency_code: "MXN",
                  value: price
                },
                reference_id: user.id
              }]
            });
          }}
          onApprove={(data, actions) => {
            return actions.order.capture().then(details => {
              const paymentData = {
                order: {
                  reference_id: details.purchase_units[0].reference_id,
                  amount: details.purchase_units[0].amount,
                  shipping: {
                    address: details.purchase_units[0].shipping?.address || {}
                  },
                  payments: {
                    captures: [
                      {
                        id: details.id,
                        status: details.status,
                        create_time: details.create_time
                      }
                    ]
                  }
                },
                password: password
              };

              const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

              fetch(isRenovation ? '/paypal/paypal-payment-renovation' : '/paypal/paypal-payment', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                  'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify(paymentData),
                credentials: 'same-origin'
              })
                .then(response => response.json())
                .then(data => {
                  if (data.success) {
                    console.log('Pago procesado exitosamente');
                    setSuccessMessage(data.message);
                    setIsRedirecting(true);
                    setTimeout(() => {
                      window.location.href = '/student-dashboard';
                    }, 5000);
                  } else {
                    console.error('Error en la respuesta del backend:', data);
                  }
                })
                .catch(error => {
                  console.error('Error en el procesamiento del pago:', error);
                });
            });
          }}
        />
      </>
    );
  };

  return (
    <div style={{ width: '100%', padding: '2rem 0.5rem', maxWidth: "750px", minHeight: "200px", position: 'relative' }}>
      <PayPalScriptProvider
        options={{
          "client-id": clientId, // "AaoanUtNBlgTbkWyFJ4Q9tJ7obMyH5MLnuNNcccXLKYW_5XJXtYhTDAvi1DY3oH1HF6ClulT2nsx0EiR",
          components: "buttons",
          currency: "MXN",
          locale: "es_MX"
        }}
      >
        <ButtonWrapper showSpinner={false} />
      </PayPalScriptProvider>
      {successMessage && (
        <div style={{ marginTop: '1rem', color: '#166534', fontWeight: 'bold', textAlign: 'center' }}>
          <Alert variant="filled" color="green">
            {successMessage}
          </Alert>
          <p style={{ marginTop: '0.5rem' }}>Serás redirigido ...</p>
          {isRedirecting && (
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
              <CircularProgress color="success" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
