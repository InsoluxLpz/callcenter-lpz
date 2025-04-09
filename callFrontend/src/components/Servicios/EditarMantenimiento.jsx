import React, { useState, useEffect, useRef } from 'react';
import Select from 'react-select';
import { Button } from '@mui/material';
import { ActualizarMantenimiento } from '../../api/ServiciosApi';
import { cargarListasEntradas } from '../../api/almacenProductosApi';

export const EditarMantenimiento = ({ modalOpen, onClose, mantenimiento, listaMotos, listaServicios }) => {
    if (!modalOpen || !mantenimiento) return null;

    const motos = listaMotos;
    const Servicios = listaServicios;

    const formatFecha = (fecha) => {
        if (!fecha) return "";
        return fecha.split("T")[0];
    };

    const [formData, setFormData] = useState({
        fecha_inicio: "",
        idMoto: "",
        idAutorizo: "",
        odometro: "",
        servicio: [],
        productos: [],
        costo_total: "",
        comentario: "",
        status: "",
    });

    const [autorizaciones, setAutorizaciones] = useState([]);
    const motoRef = useRef(null);
    const servicioRef = useRef(null);
    const autorizoRef = useRef(null)
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (mantenimiento) {
            setFormData({
                fecha_inicio: formatFecha(mantenimiento.fecha_inicio),
                odometro: mantenimiento.odometro || "",
                idMoto: mantenimiento.idMoto || "",
                idAutorizo: mantenimiento.idAutorizo || "",
                servicio: mantenimiento.servicios.map(s => s.id) || [],
                productos: mantenimiento.productos || [],
                comentario: mantenimiento.comentario || "",
                costo_total: mantenimiento.costo_total
                    ? parseFloat(mantenimiento.costo_total)
                    : 0.00,
            });
        }
    }, [mantenimiento]);


    useEffect(() => {
        const fetchAutorizo = async () => {
            const data = await cargarListasEntradas();
            if (data.autorizaciones) {
                const opciones = data.autorizaciones.map((a) => ({
                    value: a.idAutorizo,
                    label: a.nombre,
                }));
                setAutorizaciones(opciones);
            }
        };
        fetchAutorizo();
    }, []);


    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: name === "costo_total" ? parseFloat(value).toFixed(2) : value
        }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validación: Si no hay servicios seleccionados, mostrar error y no actualizar
        if (formData.servicio.length === 0) {
            setErrors((prev) => ({ ...prev, servicio: "Debe seleccionar al menos un servicio." }));
            return; // Evitar la actualización si no hay servicios seleccionados
        }

        const MantenimientoData = {
            servicios: formData.servicio,
        };

        const resultado = await ActualizarMantenimiento(mantenimiento.id, MantenimientoData);

        if (resultado && !resultado.error) {
            onClose();
            setTimeout(() => {
                window.location.reload();
            }, 700);
        }
    };


    const formatNumber = (value) => {
        return parseFloat(value).toLocaleString('es-MX');
    };

    const opcionesMotos = [...motos]
        .map((moto) => ({ value: moto.id, label: moto.inciso }));

    const opcionesServicios = [...Servicios]
        .sort((a, b) => a.nombre.localeCompare(b.nombre))
        .map((serv) => ({ value: serv.id, label: serv.nombre }));

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
        <>
            <div className="modal-backdrop">
                <div className="modal fade show" style={{ display: "block" }} tabIndex="-1" role="dialog">
                    <div className="modal-dialog" role="document" style={{ maxWidth: "40vw", marginTop: 90 }}>
                        <div className="modal-content w-100">
                            <div className="modal-header" style={{ backgroundColor: '#f1c40f' }}>
                                <h5 className="modal-title" style={{ color: 'white' }}>Actualizar Servicio</h5>
                            </div>

                            <form style={{ marginTop: 3 }} onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-md-3 mb-2">
                                        <label className="form-label">Fecha de inicio</label>
                                        <input
                                            id="fecha_inicio"
                                            name="fecha_inicio"
                                            type='date'
                                            className="form-control form-control-sm"
                                            value={formData.fecha_inicio}
                                            onChange={handleChange}
                                            onKeyDown={(e) => handleKeyDown(e, motoRef, true)}
                                            readOnly
                                        />
                                    </div>

                                    <div className="col-md-4 mb-2">
                                        <label className="form-label">Moto</label>
                                        <input
                                            ref={motoRef}
                                            id="idMoto"
                                            type="text"
                                            name="idMoto"
                                            className="form-control form-control-sm"
                                            value={opcionesMotos.find(op => op.value === formData.idMoto)?.label || ""}
                                            readOnly
                                            onKeyDown={(e) => handleKeyDown(e, "odometro")}
                                        />

                                    </div>

                                    <div className="col-md-4 mb-2">
                                        <label className="form-label">Odómetro/Horómetro</label>
                                        <input
                                            id='odometro'
                                            type="text"
                                            name="odometro"
                                            className="form-control form-control-sm"
                                            value={new Intl.NumberFormat('es-MX').format(formData.odometro)}
                                            onChange={handleChange}
                                            onKeyDown={(e) => handleKeyDown(e, servicioRef, true)}
                                            readOnly
                                        />
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-10 mb-2">
                                        <label className="form-label">Servicio(s)</label>
                                        <Select
                                            ref={servicioRef}
                                            id="servicio"
                                            name="servicio"
                                            options={opcionesServicios}
                                            placeholder="SELECCIONA"
                                            isMulti // Permitir múltiples selecciones
                                            value={opcionesServicios.filter(op => formData.servicio.includes(op.value))} // Filtrar por IDs seleccionados
                                            onChange={(selectedOptions) => {
                                                setFormData({
                                                    ...formData,
                                                    servicio: selectedOptions.map(op => op.value) // Guardar solo los IDs seleccionados
                                                });
                                            }}
                                            onKeyDown={(e) => handleKeyDown(e, autorizoRef, true)}
                                        />
                                        {errors.servicio && <div className="text-danger">{errors.servicio}</div>}

                                    </div>
                                </div>

                                <hr />

                                <h6 className="mb-2">Desglose de Partes/Refacciones de Almacén</h6>
                                <div className="table-responsive" style={{ maxHeight: "200px", overflowY: "auto" }}>
                                    <table className="table" style={{ maxWidth: "80%", margin: "auto" }}>
                                        <thead>
                                            <tr>
                                                <th style={{ textAlign: "center", width: "15%" }}>Producto</th>
                                                <th style={{ textAlign: "right", width: "15%" }}>Costo Unitario</th>
                                                <th style={{ textAlign: "right", width: "15%" }}>Cantidad</th>
                                                <th style={{ textAlign: "right", width: "15%" }}>Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {formData.productos.map((producto, index) => (
                                                <tr key={index}>
                                                    <td style={{ textAlign: "center", width: "15%" }}>{producto.nombre}</td>
                                                    <td style={{ textAlign: "right", width: "15%" }}>${formatNumber(producto.costo)}</td>
                                                    <td style={{ textAlign: "right", width: "15%" }}>{producto.cantidad}</td>
                                                    <td style={{ textAlign: "right", width: "15%" }}>${formatNumber(producto.costo * producto.cantidad)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="row">
                                    <div className="col-md-4 mb-2">
                                        <label className="form-label">Autorizó</label>
                                        <input
                                            ref={autorizoRef}
                                            id="idAutorizo"
                                            type="text"
                                            name="idAutorizo"
                                            className="form-control form-control-sm"
                                            value={autorizaciones.find(op => op.value === formData.idAutorizo)?.label || ""}
                                            readOnly
                                            onKeyDown={(e) => handleKeyDown(e, "costo_refacciones")}
                                        />

                                    </div>
                                    <div className="col-md-2 offset-md-6">
                                        <label className="form-label text-end d-block">Costo Total</label>
                                        <div className="input-group">
                                            <input
                                                id="costo_refacciones"
                                                type="text"
                                                name="costo_total"
                                                className="form-control"
                                                value={`$${(formData.costo_total || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
                                                style={{ textAlign: "right" }}
                                                readOnly
                                            />

                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-12 mb-2">
                                    <label className="form-label">Comentario</label>
                                    <textarea
                                        id="comentario"
                                        name="comentario"
                                        className="form-control form-control-sm"
                                        value={formData.comentario}
                                        onChange={handleChange}
                                        readOnly
                                    />
                                </div>

                                <div className="modal-footer">
                                    <Button type="submit" style={{ backgroundColor: "#f1c40f", color: "white" }}>
                                        Guardar
                                    </Button>

                                    <Button
                                        type="button"
                                        style={{ backgroundColor: "#7f8c8d", color: "white", marginLeft: 7 }}
                                        onClick={onClose}
                                    >
                                        Cancelar
                                    </Button>
                                </div>
                            </form>

                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};