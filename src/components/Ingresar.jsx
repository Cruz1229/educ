import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaReact, FaGoogle, FaFacebook, FaGithub } from "react-icons/fa";
import { Player } from '@lottiefiles/react-lottie-player';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import '../styles/login.css';

const useAuthNavigate = () => {
    const navigate = useNavigate();
    const goToAreas = () => navigate("/WelcomeScreen");
    return { goToAreas };
};

const Ingresar = () => {
    const { goToAreas } = useAuthNavigate();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    // Asegurarnos de que el body ocupe toda la pantalla sin scroll horizontal
    useEffect(() => {
        // Remover cualquier padding o margin del body y prevenir scroll horizontal
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        document.body.style.overflowX = 'hidden';
        document.body.style.overflowY = 'auto';
        document.documentElement.style.overflowX = 'hidden';
        
        return () => {
            // Restaurar cuando se desmonte el componente
            document.body.style.overflowX = 'auto';
            document.documentElement.style.overflowX = 'auto';
        };
    }, []);

    const handleLogin = () => {
        if (username === 'user1' && password === 'admin') {
            Swal.fire({
                title: '¡Éxito!',
                text: 'Has iniciado sesión correctamente.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
                background: '#1e3a8a',
                color: '#f1f5f9',
                customClass: {
                    popup: 'swal-custom-popup'
                }
            }).then(() => {
                goToAreas();
            });
        } else {
            Swal.fire({
                title: 'Error',
                text: 'Usuario o contraseña incorrectos.',
                icon: 'error',
                confirmButtonText: 'Intentar de nuevo',
                background: '#1e293b',
                color: '#f1f5f9',
                confirmButtonColor: '#3b82f6'
            });
        }
    };

    const handleSocialLogin = (provider) => {
        Swal.fire({
            title: 'Función en desarrollo',
            text: `Iniciando sesión con ${provider}...`,
            icon: 'info',
            timer: 2500,
            showConfirmButton: false,
            background: '#1e293b',
            color: '#f1f5f9'
        });
    };

    return (
        <div className="login-wrapper">
            <style>{`
                /* Reset para asegurar pantalla completa */
                body, html, #root {
                    margin: 0 !important;
                    padding: 0 !important;
                    width: 100% !important;
                    height: 100% !important;
                    overflow-x: hidden !important;
                }

                .login-wrapper {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    width: 100%;
                    height: 100%;
                    max-width: 100vw;
                    background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0;
                    margin: 0;
                    overflow-x: hidden;
                    overflow-y: auto;
                }

                .login-wrapper::before {
                    content: '';
                    position: absolute;
                    width: 500px;
                    height: 500px;
                    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
                    border-radius: 50%;
                    top: -150px;
                    right: -150px;
                    animation: float 6s ease-in-out infinite;
                    pointer-events: none;
                }

                .login-wrapper::after {
                    content: '';
                    position: absolute;
                    width: 400px;
                    height: 400px;
                    background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%);
                    border-radius: 50%;
                    bottom: -100px;
                    left: -100px;
                    animation: float 8s ease-in-out infinite reverse;
                    pointer-events: none;
                }

                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }

                .login-container {
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(20px);
                    border-radius: 24px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    overflow: hidden;
                    max-width: 1000px;
                    width: calc(100% - 40px);
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    position: relative;
                    z-index: 1;
                    animation: slideIn 0.5s ease-out;
                    margin: 20px;
                    box-sizing: border-box;
                }

                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .login-banner {
                    background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
                    padding: 60px 40px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    overflow: hidden;
                }

                .login-banner::before {
                    content: '';
                    position: absolute;
                    width: 300px;
                    height: 300px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 50%;
                    top: -150px;
                    left: -150px;
                }

                .login-title {
                    color: white;
                    font-size: 32px;
                    font-weight: 700;
                    margin-bottom: 30px;
                    text-align: center;
                    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
                    z-index: 1;
                }

                .login-form {
                    padding: 60px 50px;
                    display: flex;
                    flex-direction: column;
                }

                .logo-container {
                    display: flex;
                    justify-content: center;
                    margin-bottom: 30px;
                    animation: bounce 2s ease-in-out infinite;
                }

                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }

                .form-group {
                    margin-bottom: 20px;
                    position: relative;
                }

                .form-input {
                    width: 100%;
                    padding: 15px 20px;
                    border: 2px solid #e2e8f0;
                    border-radius: 12px;
                    font-size: 16px;
                    transition: all 0.3s ease;
                    background: #f8fafc;
                    outline: none;
                    box-sizing: border-box;
                }

                .form-input:focus {
                    border-color: #3b82f6;
                    background: white;
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
                    transform: translateY(-2px);
                }

                .submit-btn {
                    width: 100%;
                    padding: 16px;
                    background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    transition: all 0.3s ease;
                    margin-top: 10px;
                    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
                }

                .submit-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.6);
                }

                .submit-btn:active {
                    transform: translateY(0);
                }

                .social-login {
                    margin: 30px 0;
                }

                .divider {
                    display: flex;
                    align-items: center;
                    text-align: center;
                    margin: 25px 0;
                    color: #64748b;
                    font-size: 14px;
                }

                .divider::before,
                .divider::after {
                    content: '';
                    flex: 1;
                    border-bottom: 1px solid #e2e8f0;
                }

                .divider span {
                    padding: 0 15px;
                }

                .social-buttons {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 12px;
                }

                .social-btn {
                    padding: 12px;
                    border: 2px solid #e2e8f0;
                    border-radius: 10px;
                    background: white;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                }

                .social-btn:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
                }

                .social-btn.google { color: #DB4437; }
                .social-btn.facebook { color: #4267B2; }
                .social-btn.github { color: #333; }

                .social-btn.google:hover { 
                    background: #DB4437; 
                    color: white;
                    border-color: #DB4437;
                }

                .social-btn.facebook:hover { 
                    background: #4267B2; 
                    color: white;
                    border-color: #4267B2;
                }

                .social-btn.github:hover { 
                    background: #333; 
                    color: white;
                    border-color: #333;
                }

                .footer-links {
                    margin-top: 25px;
                    text-align: center;
                }

                .footer-links p {
                    margin: 8px 0;
                    color: #64748b;
                    font-size: 14px;
                }

                .footer-links a {
                    color: #3b82f6;
                    text-decoration: none;
                    font-weight: 600;
                    transition: color 0.3s ease;
                }

                .footer-links a:hover {
                    color: #1e3a8a;
                    text-decoration: underline;
                }

                @media (max-width: 768px) {
                    .login-container {
                        grid-template-columns: 1fr;
                        width: 95%;
                        margin: 10px;
                    }

                    .login-banner {
                        padding: 40px 20px;
                    }

                    .login-form {
                        padding: 40px 30px;
                    }

                    .login-title {
                        font-size: 24px;
                    }

                    .social-buttons {
                        grid-template-columns: repeat(3, 1fr);
                    }
                }
            `}</style>

            <div className="login-container">
                <div className="login-banner">
                    <h1 className="login-title">Bienvenido de Nuevo</h1>
                    <Player
                        src='/images/areas/Login.json'
                        className="player"
                        loop
                        autoplay
                        style={{ height: '400px', width: '400px' }}
                    />
                </div>

                <div className="login-form">
                    <div className="logo-container">
                        <Player
                            src='/images/areas/users.json'
                            className="player"
                            loop
                            autoplay
                            style={{ height: '80px', width: '80px' }}
                        />
                    </div>

                    <div className="form-group">
                        <input
                            className="form-input"
                            type="text"
                            placeholder="Usuario"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <input
                            className="form-input"
                            type="password"
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                        />
                    </div>

                    <button className="submit-btn" onClick={handleLogin}>
                        <FaReact /> Iniciar Sesión
                    </button>

                    <div className="social-login">
                        <div className="divider">
                            <span>O continúa con</span>
                        </div>
                        <div className="social-buttons">
                            <button 
                                className="social-btn google" 
                                onClick={() => handleSocialLogin('Google')}
                                title="Iniciar con Google"
                            >
                                <FaGoogle />
                            </button>
                            <button 
                                className="social-btn facebook" 
                                onClick={() => handleSocialLogin('Facebook')}
                                title="Iniciar con Facebook"
                            >
                                <FaFacebook />
                            </button>
                            <button 
                                className="social-btn github" 
                                onClick={() => handleSocialLogin('GitHub')}
                                title="Iniciar con GitHub"
                            >
                                <FaGithub />
                            </button>
                        </div>
                    </div>

                    <div className="footer-links">
                        <p>¿Olvidaste tu <a href="#">usuario / contraseña?</a></p>
                        <p>Regístrate como <a href="#">nuevo usuario</a></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Ingresar;