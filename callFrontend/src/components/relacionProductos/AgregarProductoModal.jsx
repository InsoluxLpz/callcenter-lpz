import React, { useEffect, useState, useRef } from 'react'
import { Button } from '@mui/material';
import Select from "react-select";
import { agregarProductos } from '../../api/productosApi';
import { obtenerProveedores } from '../../api/proveedoresApi';


export const AgregarProductoModal = ({ modalOpen, onClose, grupos, unidadMedida, agregarProducto }) => {
    if (!modalOpen) return null;

    const [formData, setFormData] = useState({
        codigo: "",
        nombre: "",
        grupo: "",
        precio: "",
        descripcion: "",
        unidad_medida: "",
        proveedores: [],
        status: 1
    });

    const [errors, setErrors] = useState({});
    const [proveedores, setProveedores] = useState([]);
    const marcaRef = useRef(null);
    const unidadRef = useRef(null);
    const proveedoresRef = useRef(null);

    useEffect(() => {
        const cargarProveedores = async () => {
            const data = await obtenerProveedores();
            if (data) {
                const proveedoresFiltrados = data.filter(prov => prov.status !== 0);
                console.log("Proveedores filtrados:", proveedoresFiltrados);
                setProveedores(proveedoresFiltrados.map(prov => ({
                    value: prov.id,
                    label: prov.nombre_empresa,
                })));
            }
        };
        cargarProveedores();
    }, []);


    const opcionesGrupos = grupos.map(grupo => ({ value: grupo.id, label: grupo.nombre }));
    const opcionesUnidad = unidadMedida.map(uni => ({ value: uni.id, label: uni.nombre }));

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "precio") {
            // Permitir solo números y un punto decimal
            let numericValue = value.replace(/[^0-9.]/g, "");

            // Verificar si hay más de un punto decimal y corregirlo
            const parts = numericValue.split(".");
            if (parts.length > 2) {
                numericValue = parts[0] + "." + parts.slice(1).join(""); // Mantener solo el primer punto
            }

            // Si el número tiene decimales, mantenerlo sin formato
            if (numericValue.includes(".")) {
                setFormData(prev => ({ ...prev, [name]: numericValue }));
            } else {
                // Si es número entero, formatearlo con separador de miles
                const formattedValue = new Intl.NumberFormat("es-MX").format(parseInt(numericValue || 0, 10));
                setFormData(prev => ({ ...prev, [name]: formattedValue }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        setErrors(prev => ({ ...prev, [name]: "" }));
    };


    const handleSelectChange = (selectedOptions) => {
        setFormData(prev => ({
            ...prev,
            proveedores: selectedOptions ? selectedOptions.map(option => option.value) : [],
        }));
        setErrors(prev => ({ ...prev, proveedores: "" }));
    };

    const validateForm = () => {
        const newErrors = {};
        Object.keys(formData).forEach(key => {
            if (key !== "descripcion" && !formData[key]) {
                newErrors[key] = "Este campo es obligatorio";
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Eliminar comas y convertir a número decimal
        let precioNumerico = parseFloat(formData.precio.replace(/,/g, ''));

        if (isNaN(precioNumerico)) {
            setErrors((prev) => ({ ...prev, precio: "Ingrese un precio válido" }));
            return;
        }

        const formDataConUsuario = {
            ...formData,
            precio: precioNumerico, // Guardar correctamente como número
            idUsuario: parseInt(localStorage.getItem('idUsuario'), 10)
        };

        try {
            console.log("Enviando datos al backend:", formDataConUsuario);
            const response = await agregarProductos(formDataConUsuario);
            if (response?.message === "Producto agregado correctamente") {
                onClose();
                setTimeout(() => window.location.reload(), 1000);
            } else {
                setErrors((prev) => ({ ...prev, general: "Ocurrió un error al agregar el producto." }));
            }
        } catch (error) {
            console.error("Error al agregar producto:", error);
            setErrors((prev) => ({ ...prev, general: "Ocurrió un error al agregar el producto." }));
        }
    };



    const handleKeyDown = (e, nextField, isSelect = false) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (isSelect && nextField.current) {
                nextField.current.focus();
            } else {
                document.getElementById(nextField)?.focus();
            }
        }
    };

    return (
        <div className="modal-backdrop">
            <div className="modal fade show" style={{ display: "block" }} aria-labelledby="exampleModalLabel" tabIndex="-1" role="dialog">
                <div className="modal-dialog" role="document" style={{ maxWidth: "50vw", marginTop: 90 }}>
                    <div className="modal-content w-100" style={{ maxWidth: "50vw" }}>
                        <div className="modal-header" style={{ backgroundColor: '#1f618d' }}>
                            <h5 className="modal-title" style={{ color: 'white' }}>Agregar Producto</h5>
                        </div>

                        <form onSubmit={handleSubmit} style={{ padding: "20px", maxHeight: "300vh" }}>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Código</label>
                                        <input
                                            id="codigo"
                                            type="text"
                                            name="codigo"
                                            className={`form-control ${errors.codigo ? "is-invalid" : ""}`}
                                            value={formData.codigo}
                                            onChange={handleChange}
                                            onKeyDown={(e) => handleKeyDown(e, "nombre")}
                                        />
                                        {errors.codigo && <div className="invalid-feedback">{errors.codigo}</div>}
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Nombre</label>
                                        <input
                                            id="nombre"
                                            type="text"
                                            name="nombre"
                                            className={`form-control ${errors.nombre ? "is-invalid" : ""}`}
                                            value={formData.nombre}
                                            onChange={handleChange}
                                            onKeyDown={(e) => handleKeyDown(e, marcaRef, true)}
                                        />
                                        {errors.nombre && <div className="invalid-feedback">{errors.nombre}</div>}
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Grupo</label>
                                        <Select
                                            ref={marcaRef}
                                            id="grupo"
                                            options={opcionesGrupos}
                                            placeholder="SELECCIONA"
                                            value={opcionesGrupos.find(gr => gr.value === formData.grupo)}
                                            onChange={(selectedOption) => setFormData({ ...formData, grupo: selectedOption.value })}
                                            onKeyDown={(e) => handleKeyDown(e, "precio")}
                                        />
                                        {errors.grupo && <div className="text-danger small">{errors.grupo}</div>}
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Unidad de Medida</label>
                                        <Select
                                            ref={unidadRef}
                                            id='unidad_medida'
                                            options={opcionesUnidad}
                                            placeholder="SELECCIONA"
                                            value={opcionesUnidad.find(um => um.value === formData.unidad_medida)}
                                            onChange={(selectedOption) => setFormData({ ...formData, unidad_medida: selectedOption.value })}
                                            onKeyDown={(e) => handleKeyDown(e, proveedoresRef, true)}
                                        />
                                        {errors.unidad_medida && <div className="text-danger small">{errors.unidad_medida}</div>}
                                    </div>

                                </div>

                                <div className="row">
                                    <div className="col-md-8 mb-3">
                                        <label className="form-label">Proveedores</label>
                                        <Select
                                            ref={proveedoresRef}
                                            id='unidad_medida'
                                            options={proveedores}
                                            isMulti
                                            placeholder="SELECCIONA"
                                            value={proveedores.filter(p => formData.proveedores.includes(p.value))}
                                            onChange={handleSelectChange}
                                            onKeyDown={(e) => handleKeyDown(e, "descripcion")}
                                        />
                                        {errors.proveedores && <div className="text-danger small">{errors.proveedores}</div>}
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-12 mb-3">
                                        <label className="form-label">Descripción</label>
                                        <textarea
                                            id='descripcion'
                                            name="descripcion"
                                            className="form-control"
                                            value={formData.descripcion}
                                            onChange={handleChange}
                                        ></textarea>
                                    </div>
                                </div>
                            </div>

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