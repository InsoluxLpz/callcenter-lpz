import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../styles/LoginScreen.css';
import { NavBar } from '../components/NavBar';

// * Variables de entorno
const API_URL = import.meta.env.VITE_API_URL;

export const LoginScreen = () => {
    const [form, setForm] = useState({ usuario: '', password: '' });
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                mode: "cors",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(form),
            });

            if (response.ok) {
                const data = await response.json();
                console.log(data);
                // Guardar tanto el token de acceso como el refresh token
                localStorage.setItem('token', data.token);
                localStorage.setItem('idUsuario', data.id);
                localStorage.setItem('usuario', data.nombre);

                Swal.fire({
                    position: "center",
                    icon: "success",
                    title: "Login Exitoso",
                    showConfirmButton: false,
                    timer: 1000
                });

                setTimeout(() => {
                    navigate('/Motos');
                }, 800);
            } else {
                const errorData = await response.json();
                Swal.fire('Error', errorData.message || 'Error al iniciar sesión.', 'error');
            }
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            Swal.fire('Error', 'Error de conexión con el servidor.', 'error');
        }
    };

    return (
        <>
            <NavBar />
            <div className="login-container">
                <div className="login-card">
                    <h2 className="login-title">Bienvenido</h2>
                    <p className="login-subtext">Ingresa tus datos para iniciar sesión</p>
                    <form onSubmit={handleLogin}>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Usuario"
                            name="usuario"
                            value={form.usuario}
                            onChange={handleInputChange}
                        />
                        <input
                            type="password"
                            className="form-control"
                            placeholder="Contraseña"
                            name="password"
                            value={form.password}
                            onChange={handleInputChange}
                        />
                        <button type="submit" className="btn-submit">
                            INGRESAR
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};
