
import Swal from 'sweetalert2';

const API_URL = import.meta.env.VITE_API_URL;

export const ObtenerServicios = async () => {
    try {
        const response = await fetch(`${API_URL}/servicios/obtener_servicio`, {
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

export const AgregarServicio = async (servicioData) => {
    try {

        const response = await fetch(`${API_URL}/servicios/agregar_servicio`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(servicioData),
        });

        const data = await response.json();

        if (response.ok) {
            Swal.fire({
                title: 'Éxito',
                text: 'Servicio agregado correctamente.',
                icon: 'success',
                confirmButtonText: 'Aceptar'
            });
            return data;
        } else {
            Swal.fire('Error', data.message || 'Hubo un problema al agregar el servicio.', 'error');
            return { error: data.message || 'Hubo un problema al agregar el servicio.' };
        }
    } catch (error) {
        console.error('Error al realizar la solicitud:', error);
        Swal.fire('Error', 'Hubo un problema al conectar con el servidor.', 'error');
        return null;
    }
};

export const ActualizarServicio = async (id, servicioData) => {
    try {
        const response = await fetch(`${API_URL}/servicios/actualizar_servicio/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(servicioData),
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
            title: "¿Estás seguro?",
            text: "Esta acción cambiará el status del servicio a inactivo",
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

        const response = await fetch(`${API_URL}/servicios/actualizar_status_servicio/${id}`, {
            method: 'PUT',
        });

        if (response.ok) {
            Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Status actualizado correctamente',
                showConfirmButton: true,
            });

            // Llamar al callback para actualizar la lista con el id del servicio
            actualizarLista(id);
        } else {
            throw new Error('Error al actualizar el status');
        }
    } catch (error) {
        console.error('Error al realizar la solicitud:', error);
        Swal.fire('Error', 'Hubo un problema al conectar con el servidor.', 'error');
    }
};

// *<===================================== SERVICIOS MOTOS ====================================================================>

export const ObtenerMantenimientos = async ({ filtro }) => {
    const params = new URLSearchParams();

    if (filtro.fecha_inicio) params.append("fecha_inicio", filtro.fecha_inicio);
    if (filtro.fecha_final) params.append("fecha_final", filtro.fecha_final);
    if (filtro.servicio) params.append("servicio", filtro.servicio);
    if (filtro.moto) params.append("moto", filtro.moto);
    if (filtro.todos !== undefined) params.append("todos", filtro.todos ? "1" : "0");

    try {
        const response = await fetch(`${API_URL}/servicios/obtener_mantenimientos?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        if (response.ok) {
            const data = await response.json();
            console.log("Respuesta del backend:", data);
            return data;
        }
    } catch (error) {
        console.error('Error al realizar la solicitud:', error);
        Swal.fire('Error', 'Hubo un problema al conectar con el servidor.', 'error');
        return null;
    }
};

export const AgregarMantenimiento = async (mantenimientoData, actualizarLista) => {
    try {
        const response = await fetch(`${API_URL}/servicios/agregar_mantenimiento`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(mantenimientoData),
        });

        const data = await response.json();

        if (response.ok) {
            Swal.fire({
                title: 'Éxito',
                text: 'Servicio agregado correctamente.',
                icon: 'success',
                confirmButtonText: 'Aceptar'
            });
            return data;
        } else {
            // 🔽 Ahora muestra correctamente el mensaje de error del backend
            Swal.fire('Error', data.error || 'Hubo un problema al agregar el servicio.', 'error');
            return { error: data.error || 'Hubo un problema al agregar el servicio.' };
        }
    } catch (error) {
        console.error('Error al realizar la solicitud:', error);
        Swal.fire('Error', 'Hubo un problema al conectar con el servidor.', 'error');
        return null;
    }
};

export const ActualizarMantenimiento = async (id, MantenimientoData) => {
    try {
        const response = await fetch(`${API_URL}/servicios/actualizar_mantenimiento/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(MantenimientoData),
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
            Swal.fire('Error', data.message || 'Hubo un problema al actualizar el mantenimiento.', 'error');
            return { error: data.message || 'Hubo un problema al actualizar el mantenimiento.' };
        }
    } catch (error) {
        console.error('Error al realizar la solicitud:', error);
        Swal.fire('Error', 'Hubo un problema al conectar con el servidor.', 'error');
        return null;
    }
};

export const EliminarMantenimiento = async (id, actualizarLista) => {
    try {
        const result = await Swal.fire({
            title: "¿Estás seguro de cancelar este mantenimiento?",
            text: "El mantenimiento será marcado como cancelado.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#f1c40f",
            cancelButtonColor: "#7f8c8d",
            confirmButtonText: "Sí, cancelar",
            cancelButtonText: "No"
        });

        if (!result.isConfirmed) {
            return;
        }

        // Obtener el idUsuario desde localStorage
        const idUsuario = localStorage.getItem("idUsuario");
        if (!idUsuario) {
            Swal.fire('Error', 'No se encontró el usuario en la sesión.', 'error');
            return;
        }

        const response = await fetch(`http://192.168.0.104:4000/servicios/cancelar_mantenimiento/${id}`, {
            method: 'DELETE',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idUsuario }) // Enviar el ID del usuario que cancela
        });

        if (response.ok) {
            Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Mantenimiento cancelado correctamente',
                showConfirmButton: true,
            });

            // Actualizar la lista eliminando el mantenimiento de la vista
            actualizarLista(id);
        } else {
            throw new Error('Error al cancelar mantenimiento');
        }
    } catch (error) {
        console.error('Error al realizar la solicitud:', error);
        Swal.fire('Error', 'Hubo un problema al conectar con el servidor.', 'error');
    }
};
