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
    </div>
  );
}

