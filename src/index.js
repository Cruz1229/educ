import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App';
import './styles/theme.css';
import './styles/screens.css';
import './App.css'
import Login from '@react-login-page/page2';
import defaultBannerImage from '@react-login-page/page2/banner-image';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);