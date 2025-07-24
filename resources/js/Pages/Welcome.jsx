import { useEffect, useState } from 'react';
import axios from 'axios';

import LandingHeader from '@/Pages/Landing/LandingHeader';
import IntroSection from '@/Pages/Landing/IntroSection';
import Footer from '@/Pages/Landing/Footer';
import '../Components/LandingPage.css';

export default function Welcome() {
  const [content, setContent] = useState(null);
  useEffect(() => {
    axios.get('/landing-content')
      .then(response => setContent(response.data))
      .catch(error => console.error('Error al obtener contenido:', error));
  }, []);
  if (!content) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="landing-container">
      <LandingHeader content={content}/>
      <IntroSection content={content}/>
      <Footer content={content}/>
      {/* Botón flotante de WhatsApp */}
      <a
        href={`https://wa.me/${content.whatsapp_number}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          textDecoration: 'none',
        }}
      >
        <img
          src="/assets/whatsapp.png"
          alt="WhatsApp"
          style={{
            width: '50px',
            height: '50px',
          }}
        />
      </a>

    </div>
  );
}

