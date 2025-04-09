import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { LoginScreen } from '../screen/LoginScreen';
import { HomeScreen } from '../screen/HomeScreen';
import PrivateRoutes from '../routes/PrivateRoutes';

export const AppRoutes = () => {
    return (

        <Routes>
            {/* Rutas públicas */}
            <Route >
                <Route path="/" element={<LoginScreen />} />
            </Route>

            {/* Rutas privadas */}
            <Route element={<PrivateRoutes />}>
                <Route path="/Inicio" element={<HomeScreen />} />
            </Route>
        </Routes>

    );
};
