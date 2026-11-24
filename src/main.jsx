import React from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/rubik/latin-500.css';
import '@fontsource/rubik/latin-700.css';
import '@fontsource/heebo/latin-400.css';
import '@fontsource/heebo/latin-500.css';
import './styles/tokens.css';
import './styles/base.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(<App />);
