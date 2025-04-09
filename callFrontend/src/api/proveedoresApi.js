import Swal from 'sweetalert2';


// * variables de entorno
const API_URL = import.meta.env.VITE_API_URL;

export const obtenerProveedores = async () => {
    try {
        const response = await fetch(`${API_URL}/proveedores/obtener_proveedores`, {
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

export const agregarProveedor = async (proveedoresData) => {
    try {
        const response = await fetch(`${API_URL}/proveedores/agregar_proveedor`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(proveedoresData),
        });

        const data = await response.json();

        if (response.ok) {
            Swal.fire({
                title: 'Éxito',
                text: 'Proveedor agregado correctamente.',
                icon: 'success',
                confirmButtonText: 'Aceptar'
            });
            return data;
        } else {
            return { error: data.message || 'Hubo un problema al agregar el proveedor.' };
        }
    } catch (error) {
        console.error('Error al realizar la solicitud:', error);
        return { error: 'Hubo un problema al conectar con el servidor.' };
    }
};


export const actualizarProovedor = async (id, proveedoresData) => {
    try {
        const response = await fetch(`${API_URL}/proveedores/actualizar_proveedor/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(proveedoresData),
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
            title: "¿Estás seguro que desea eliminar el proveedores?",
            text: "Esta acción cambiara el status de la nota a inactiva",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#f5b041",
            cancelButtonColor: "#a93226",
            confirmButtonText: "Sí, cambiar",
            cancelButtonText: "Cancelar"
        });

        if (!result.isConfirmed) {
            return;
        }

        const response = await fetch(`${API_URL}/proveedores/actualizar_status_proveedores/${id}`, {
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