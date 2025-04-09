import Swal from 'sweetalert2';


// * variables de entorno
const API_URL = import.meta.env.VITE_API_URL;

export const obtenerProductos = async () => {
    try {
        const response = await fetch(`${API_URL}/productos/obtener_productos`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        if (response.ok) {
            const data = await response.json()
            return data;
        }

    } catch (error) {
        console.error('Error al realizar la solicitud:', error);
        Swal.fire('Error', 'Hubo un problema al conectar con el servidor.', 'error');
        return null;
    }

};

export const agregarProductos = async (productoData) => {
    try {
        const response = await fetch(`${API_URL}/productos/agregar_producto`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(productoData),
        });

        if (response.ok) {
            const data = await response.json();
            Swal.fire({
                title: 'Éxito',
                text: 'Producto agregado correctamente.',
                icon: 'success',
                confirmButtonText: 'Aceptar'
            });

            return data;
        } else {
            const data = await response.json();
            Swal.fire('Error', data.message || 'Hubo un problema al agregar el producto.', 'error');
            return { error: data.message || 'Hubo un problema al agregar el producto.' };
        }
    } catch (error) {
        console.error('Error al realizar la solicitud:', error);
        Swal.fire('Error', 'Hubo un problema al conectar con el servidor.', 'error');
        return null;
    }
};


export const actualizarProductos = async (id, productoData) => {
    try {
        const response = await fetch(`${API_URL}/productos/actualizar_producto/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productoData),
        })

        const data = await response.json();

        if (response.ok) {
            Swal.fire({
                title: 'Éxito',
                text: 'Datos actualziados correctamente.',
                icon: 'success',
                confirmButtonText: 'Aceptar'
            });
            return data;
        } else {
            Swal.fire('Error', data.message || 'Hubo un problema al agregar la moto.', 'error');
            return { error: data.message || 'Hubo un problema al agregar la moto.' };
        }
    } catch (error) {
        console.error('Error al realizar la solicitud:', error);
        Swal.fire('Error', 'Hubo un problema al conectar con el servidor.', 'error');
        return null;
    }
};

// * actualizar status para mostrar
export const ActualizarStatus = async (id, actualizarLista) => {
    try {
        const result = await Swal.fire({
            title: "¿Estás seguro?",
            text: "Esta acción cambiara el status del prodcuto a inactivo",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#f1c40f",
            cancelButtonColor: "#7f8c8d",
            confirmButtonText: "Sí, cambiar",
            cancelButtonText: "Cancelar"
        });

        if (!result.isConfirmed) {
            return;
        }

        const response = await fetch(`${API_URL}/productos/actualizar_status_productos/${id}`, {
            method: 'PUT',
        });

        if (response.ok) {
            Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Status actualizado correctamente',
                showConfirmButton: true,
            });

            // Actualizar la lista de motos después de eliminar
            actualizarLista(id);
        } else {
            throw new Error('Error al actualizar el status');
        }
    } catch (error) {
        console.error('Error al realizar la solicitud:', error);
        Swal.fire('Error', 'Hubo un problema al conectar con el servidor.', 'error');
    }
};

export const obtenerEntradas = async () => {
    try {
        const response = await fetch(`${API_URL}/productos/obtener_entradas`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        if (response.ok) {
            const data = await response.json()
            return data;
        }

    } catch (error) {
        console.error('Error al realizar la solicitud:', error);
        Swal.fire('Error', 'Hubo un problema al conectar con el servidor.', 'error');
        return null;
    }
};

export const agregarEntradas = async (entradaData) => {
    try {

        const response = await fetch(`${API_URL}/productos/agregar_entrada`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(entradaData),
        });

        const data = await response.json();

        if (response.ok) {
            Swal.fire({
                title: 'Éxito',
                text: 'Entrada agregada correctamente.',
                icon: 'success',
                confirmButtonText: 'Aceptar'
            });
            return data;
        } else {
            Swal.fire('Error', data.message || 'Hubo un problema al agregar la entrada.', 'error');
            return { error: data.message || 'Hubo un problema al agregar la moto.' };
        }
    } catch (error) {
        console.error('Error al realizar la solicitud:', error);
        Swal.fire('Error', 'Hubo un problema al conectar con el servidor.', 'error');
        return null;
    }
};

export const obtenerGrupos = async () => {
    try {
        const response = await fetch(`${API_URL}/productos/obtener_grupos`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        if (response.ok) {
            const data = await response.json()
            return data;
        }

    } catch (error) {
        console.error('Error al realizar la solicitud:', error);
        Swal.fire('Error', 'Hubo un problema al conectar con el servidor.', 'error');
        return null;
    }
};

export const obtenerUnidadMedidas = async () => {
    try {
        const response = await fetch(`${API_URL}/productos/obtener_unidad_medida`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        if (response.ok) {
            const data = await response.json()
            return data;
        }

    } catch (error) {
        console.error('Error al realizar la solicitud:', error);
        Swal.fire('Error', 'Hubo un problema al conectar con el servidor.', 'error');
        return null;
    }
};