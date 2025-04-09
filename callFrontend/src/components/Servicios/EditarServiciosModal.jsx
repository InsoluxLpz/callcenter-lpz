import { useEffect, useState } from "react";
import { ActualizarServicio } from "../../api/ServiciosApi";
import { Button } from '@mui/material';

export const EditarServiciosModal = ({ onClose, modalOpen, servicio, actualizarLista, ListaServicios }) => {
    if (!modalOpen) return null;

    const Servicios = ListaServicios;

    const [formData, setFormData] = useState({
        nombre: servicio.nombre,
        descripcion: servicio.descripcion,
        status: servicio.status,
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (servicio) {
            setFormData({
                nombre: servicio.nombre || "",
                descripcion: servicio.descripcion || "",
                status: servicio.status || "",
            });
        }
    }, [servicio]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const validateForm = () => {
        const newErrors = {};
        Object.keys(formData).forEach((key) => {
            if (!formData[key]?.toString().trim()) {
                newErrors[key] = "Este campo es obligatorio";
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Limpiar espacios al principio y al final del nombre SOLO antes de enviar
        const cleanedFormData = {
            ...formData,
            nombre: formData.nombre.trim(),
        };

        setFormData(cleanedFormData);

        // Validar si el nombre ya existe en los servicios
        const nombreServicioExistente = Servicios.find(
            (serv) => serv.nombre.toLowerCase() === cleanedFormData.nombre.toLowerCase() && serv.id !== servicio.id
        );

        if (nombreServicioExistente) {
            setErrors((prev) => ({
                ...prev,
                nombre: "Ya existe un servicio con ese nombre",
            }));
            return;
        }

        if (!validateForm()) return;

        // Hacer la solicitud PUT al backend para actualizar el servicio
        const response = await ActualizarServicio(servicio.id, cleanedFormData);

        if (response) {
            actualizarLista(response);
            onClose();
        }
    };

    const handleKeyDown = (e, nextField) => {
        if (e.key === "Enter") {
            e.preventDefault();
            document.getElementById(nextField)?.focus();
        }
    };

    return (
        <div className="modal-backdrop">
            <div className="modal fade show" style={{ display: "block" }} aria-labelledby="exampleModalLabel" tabIndex="-1" role="dialog">
                <div className="modal-dialog" role="document" style={{ maxWidth: "60vw", marginTop: 90 }}>
                    <div className="modal-content w-100" style={{ maxWidth: "60vw" }}>
                        <div className="modal-header" style={{ backgroundColor: '#f1c40f' }}>
                            <h5 className="modal-title" style={{ color: 'white' }}>Editar Servicio</h5>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-12 mb-3">
                                        <label className="form-label">Nombre</label>
                                        <input id="nombre" type="text" name="nombre" className={`form-control ${errors.nombre ? "is-invalid" : ""}`} value={formData.nombre} onChange={handleChange} onKeyDown={(e) => handleKeyDown(e, "descripcion")} />
                                        {errors.nombre && <div className="invalid-feedback">{errors.nombre}</div>}
                                    </div>

                                    <div className="col-md-12 mb-3">
                                        <label className="form-label">Descripcion</label>
                                        <textarea id="descripcion" type="text" name="descripcion" className={`form-control ${errors.descripcion ? "is-invalid" : ""}`} value={formData.descripcion} onChange={handleChange} onKeyDown={(e) => handleKeyDown(e, "status")} />
                                        {errors.descripcion && <div className="invalid-feedback">{errors.descripcion}</div>}
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Activar/Desactivar servicio</label>
                                        <select
                                            id="status"
                                            name="status"
                                            className={`form-control ${errors.status ? "is-invalid" : ""}`}
                                            value={formData.status}  // Asegúrate de que `formData.status` proviene de la BD
                                            onChange={handleChange}
                                        >
                                            <option value="">Seleccionar</option>
                                            <option value="1">Activo</option>
                                            <option value="0">Inactivo</option>
                                        </select>
                                        {errors.status && (
                                            <div className="invalid-feedback">{errors.status}</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <Button type="submit" style={{ backgroundColor: "#f1c40f", color: "white" }} onClick={handleSubmit}>
                                    Guardar
                                </Button>

                                <Button type="button" style={{ backgroundColor: "#7f8c8d", color: "white", marginLeft: 7 }} onClick={onClose}>
                                    Cancelar
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};