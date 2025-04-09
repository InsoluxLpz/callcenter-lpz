import { Button } from '@mui/material';
import React, { useState } from 'react'
import { agregarMarcas } from '../../api/marcasApi';

export const MarcasModal = ({ onClose, modalOpen }) => {
    if (!modalOpen) return null;

    const [formData, setFormData] = useState({ nombre: "" });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;

        const cleanedValue = value.replace(/\s+/g, "").trim();
        setFormData((prev) => ({ ...prev, [name]: cleanedValue }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const validateForm = () => {
        const newErrors = {};
        Object.keys(formData).forEach((key) => {
            if (key !== "nota" && !formData[key].trim()) {
                newErrors[key] = "Este campo es obligatorio";
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0; // Retorna true si no hay errores
    };

    const handleSubmit = async (e) => {
        if (!validateForm()) return; // Si hay errores, no se envía el formulario

        const nuevaMarca = await agregarMarcas(formData);
        if (nuevaMarca) {
            onClose();
        }
    }

    return (
        <div className="modal-backdrop">
            <div className="modal fade show" style={{ display: "block" }} aria-labelledby="exampleModalLabel" tabIndex="-1" role="dialog">
                <div className="modal-dialog" role="document" style={{ maxWidth: "20vw", marginTop: 90 }}>
                    <div className="modal-content w-100" style={{ maxWidth: "60vw" }}>
                        <div className="modal-header" style={{ backgroundColor: '#1f618d' }}>
                            <h5 className="modal-title" style={{ color: 'white' }}>Agregar Marca</h5>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Nombre</label>
                                        <input type="text" name="nombre" className={`form-control ${errors.nombre ? "is-invalid" : ""}`} value={formData.nombre} onChange={handleChange} />
                                        {errors.nombre && <div className="invalid-feedback">{errors.nombre}</div>}
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <Button type="submit" style={{ backgroundColor: '#f1c40f  ', color: 'white' }} >Guardar</Button>
                                < Button type="button" style={{ backgroundColor: '#7f8c8d', color: 'white', marginLeft: 5 }} onClick={onClose}>Cancelar</Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};