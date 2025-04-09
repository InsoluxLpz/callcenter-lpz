import React, { useState } from "react";
import { Box, Button } from "@mui/material";
import { AgregarServicio } from "../../api/ServiciosApi";

export const AgregarServicios = ({ modalOpen, onClose, agregarServicioLista }) => {
    if (!modalOpen) return null;

    const [servicio, setServicio] = useState({
        nombre: "",
        descripcion: ""
    });
    const [errors, setErrors] = useState({});

    const handleChange = (event) => {
        setServicio({
            ...servicio,
            [event.target.name]: event.target.value.trimStart()
        });
    };

    const validateForm = () => {
        const newErrors = {};

        Object.keys(servicio).forEach((key) => {
            if (key === "descripcion") return;
            if (Array.isArray(servicio[key])) {
                if (servicio[key].length === 0) {
                    newErrors[key] = "Este campo es obligatorio";
                }
            } else if (!servicio[key].trim()) {
                newErrors[key] = "Este campo es obligatorio";
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        // Eliminar los espacios al final solo al momento de enviar
        const servicioSinEspaciosFinales = {
            ...servicio,
            nombre: servicio.nombre.trimEnd()
        };

        if (!validateForm()) return;

        const response = await AgregarServicio(servicioSinEspaciosFinales);
        onClose();

        if (response && !response.error) {
            // Agregar el nuevo servicio a la lista sin necesidad de recargar la página
            agregarServicioLista(response); // Llamamos a la función para agregarlo a la lista
            setServicio({
                nombre: "",
                descripcion: "",
            });

            setErrors({});

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
                <div className="modal-dialog" role="document" style={{ maxWidth: "30vw", marginTop: 90 }}>
                    <div className="modal-content w-100" style={{ maxWidth: "60vw" }}>
                        <div className="modal-header" style={{ backgroundColor: '#1f618d' }}>
                            <h5 className="modal-title" style={{ color: 'white' }}>Agregar Servicio</h5>
                        </div>

                        <form onSubmit={handleSubmit} style={{ padding: "20px" }}>
                            <Box sx={{ maxWidth: "2000px", margin: "0 auto" }}>
                                <div className="row">
                                    <div className="col-md-10 mb-3">
                                        <label className="form-label">Nombre</label>
                                        <input
                                            id="nombre"
                                            type="text"
                                            name="nombre"
                                            className={`form-control ${errors.nombre ? "is-invalid" : ""} `}
                                            value={servicio.nombre}
                                            onChange={handleChange}
                                            onKeyDown={(e) => handleKeyDown(e, "descripcion")}
                                        />
                                        {errors.nombre && (
                                            <div className="invalid-feedback">{errors.nombre}</div>
                                        )}
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-10 mb-3">
                                        <label className="form-label">Descripción</label>
                                        <textarea
                                            id="descripcion"
                                            type="text"
                                            name="descripcion"
                                            className={`form-control ${errors.descripcion ? "is-invalid" : ""}`}
                                            value={servicio.descripcion}
                                            onChange={handleChange}
                                        />
                                        {errors.descripcion && (
                                            <div className="invalid-feedback">{errors.descripcion}</div>
                                        )}
                                    </div>
                                </div>
                            </Box>
                            <div className="modal-footer">
                                <Button type="submit" style={{ backgroundColor: "#f1c40f", color: "white" }}>
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
