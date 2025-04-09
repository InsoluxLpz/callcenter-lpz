import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";


const PrivateRoutes = () => {
    const token = localStorage.getItem("token");

    if (!token) {
        return <Navigate to="/" />;
    }

    try {
        const decodedToken = jwtDecode(token);
        const currentTime = Math.floor(Date.now() / 1000);

        if (decodedToken.exp < currentTime) {
            localStorage.removeItem("token");
            return <Navigate to="/" />;
        }

    } catch (error) {
        console.error("Error al decodificar el token:", error);
        localStorage.removeItem("token");
        return <Navigate to="/" />;
    }

    return <Outlet />;
};

export default PrivateRoutes;
