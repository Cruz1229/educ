import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App';
import './styles/theme.css';
import './styles/screens.css';
import './App.css'
import Login from '@react-login-page/page2';
import LoginPage, { Reset, Logo, Email, Banner, Submit, Title, ButtonAfter, Button, Password, Input } from '@react-login-page/page2';
import LoginLogo from 'react-login-page/logo-rect';
import defaultBannerImage from '@react-login-page/page2/banner-image';
import { Player } from '@lottiefiles/react-lottie-player';
import { GiVrHeadset } from "react-icons/gi";
import { FaReact } from "react-icons/fa";
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';



const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <App></App>
  

);
