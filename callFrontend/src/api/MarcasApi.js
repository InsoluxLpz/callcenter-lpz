import Swal from 'sweetalert2';

// * variables de entorno
const API_URL = import.meta.env.VITE_API_URL;

export const obtenerMarcas = async () => {
    try {
        const response = await fetch(`${API_URL}/marcas`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        if (response.ok) {
            const data = await response.json();
            return data;
        }

    } catch (error) {
        console.error('Error al realizar la solicitud:', error);
        Swal.fire('Error', 'Hubo un problema al conectar con el servidor.', 'error');
        return null;
    }
};

export const agregarMarcas = async (marcaData) => {
    try {
        const response = await fetch(`${API_URL}/agregar_marcas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(marcaData),
        })
        const data = await response.json();

        if (response.ok) {
            Swal.fire({
                title: 'Éxito',
                text: 'Marca agregada correctamente.',
                icon: 'success',
                confirmButtonText: 'Aceptar'
            });
            return data;
        }

    } catch (error) {
        console.error('Error al realizar la solicitud:', error);
        Swal.fire('Error', 'Hubo un problema al conectar con el servidor.', 'error');
        return null;
    }
};