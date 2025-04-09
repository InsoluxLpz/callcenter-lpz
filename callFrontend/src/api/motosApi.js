import Swal from 'sweetalert2';

// * variables de entorno
const API_URL = import.meta.env.VITE_API_URL;

export const obtenerMotos = async () => {
    try {
        const response = await fetch(`${API_URL}/obtener_motos`, {
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

export const agregarMoto = async (motoData) => {
    try {
        const response = await fetch(`${API_URL}/agregar_moto`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(motoData),
        });

        const data = await response.json();

        if (response.ok) {
            Swal.fire({
                title: 'Éxito',
                text: 'Moto agregada correctamente.',
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

export const ActualizarMoto = async (id, motoData) => {
    try {
        const response = await fetch(`${API_URL}/actualizar_moto/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(motoData),
        });

        const data = await response.json();

        if (response.ok) {
            Swal.fire({
                title: 'Éxito',
                text: 'Datos actualizados correctamente.',
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

export const ActualizarStatus = async (id, actualizarLista) => {
    try {
        const result = await Swal.fire({
            title: "¿Estás seguro de cambiar el status?",
            text: "Esta acción cambiara el status de la nota a inactiva",
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

        const response = await fetch(`${API_URL}/actualizar_status/${id}`, {
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
    // };
}



// export const eliminarMoto = async (id, actualizarLista) => {
//     try {
//         const result = await Swal.fire({
//             title: "¿Estás seguro de eliminar esta moto?",
//             text: "Esta acción no se puede deshacer.",
//             icon: "question",
//             showCancelButton: true,
//             confirmButtonColor: "#170250",
//             cancelButtonColor: "#d33",
//             confirmButtonText: "Sí, eliminar",
//             cancelButtonText: "Cancelar"
//         });

//         if (!result.isConfirmed) {
//             return;
//         }

//         const response = await fetch(`http://192.168.0.104:4000/eliminar_moto/${id}`, {
//             method: 'DELETE',
//         });

//         if (response.ok) {
//             Swal.fire({
//                 position: 'center',
//                 icon: 'success',
//                 title: 'Moto eliminada correctamente',
//                 showConfirmButton: true,
//             });

//             // Actualizar la lista de motos después de eliminar
//             actualizarLista(id);
//         } else {
//             throw new Error('Error al eliminar moto');
//         }
//     } catch (error) {
//         console.error('Error al realizar la solicitud:', error);
//         Swal.fire('Error', 'Hubo un problema al conectar con el servidor.', 'error');
//     }
// };



