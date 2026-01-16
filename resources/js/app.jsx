import '../css/app.css';
import './bootstrap';

import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';

let updateSW; // 👈 importante

updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    // fuerza a aplicar el nuevo SW de inmediato
    updateSW(true);
  },
  onOfflineReady() {
    // opcional
  },
});

const appName = import.meta.env.VITE_APP_NAME || 'COMPASS';

createInertiaApp({
  title: (title) => `${title} - ${appName}`,
  resolve: (name) =>
    resolvePageComponent(
      `./Pages/${name}.jsx`,
      import.meta.glob('./Pages/**/*.jsx'),
    ),
  setup({ el, App, props }) {
    createRoot(el).render(<App {...props} />);
  },
  progress: { color: '#4B5563' },
});
