import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { Button } from '@mui/material';
import { cargarListasEntradas } from '../../api/almacenProductosApi';

export const VerMantenimientoCancelado = ({ modalOpen, onClose, mantenimiento, listaMotos, listaServicios }) => {
    if (!modalOpen || !mantenimiento) return null;

    const motos = listaMotos;
    const Servicios = listaServicios;

    const formatFecha = (fecha) => {
        if (!fecha) return "";
        return fecha.split("T")[0];
    };

    const [formData, setFormData] = useState({
        fecha_inicio: "",
        fecha_cancelacion: "",
        idMoto: "",
        idAutorizo: "",
        odometro: "",
        servicio: [],
        productos: [],
        costo_total: "",
        comentario: "",
        status: "",
        nombre: "",
    });

    const [autorizaciones, setAutorizaciones] = useState([]);

    useEffect(() => {
        if (mantenimiento) {
            setFormData({
                fecha_inicio: formatFecha(mantenimiento.fecha_inicio),
                fecha_cancelacion: formatFecha(mantenimiento.fecha_cancelacion),
                odometro: mantenimiento.odometro || "",
                idMoto: mantenimiento.idMoto || "",
                idAutorizo: mantenimiento.idAutorizo || "",
                servicio: mantenimiento.servicios.map(s => s.id) || [],
                productos: mantenimiento.productos || [],
                comentario: mantenimiento.comentario || "",
                costo_total: mantenimiento.costo_total
                    ? parseFloat(mantenimiento.costo_total) // ✅ Convertir a número correctamente
                    : 0.00, // ✅ Si está vacío, ponerlo en 0.00
                nombre: mantenimiento.nombre || "",
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


    const formatNumber = (value) => {
        return parseFloat(value).toLocaleString('es-MX'); // Formato para México (1,500.00)
    };

    const opcionesMotos = [...motos]
        .map((moto) => ({ value: moto.id, label: moto.inciso }));

    const opcionesServicios = [...Servicios]
        .sort((a, b) => a.nombre.localeCompare(b.nombre))
        .map((serv) => ({ value: serv.id, label: serv.nombre }));


    return (
        <>
            <div className="modal-backdrop">
                <div className="modal fade show" style={{ display: "block" }} tabIndex="-1" role="dialog">
                    <div className="modal-dialog" role="document" style={{ maxWidth: "40vw", marginTop: 90 }}>
                        <div className="modal-content w-100">
                            <div className="modal-header" style={{ backgroundColor: '#c0392b' }}>
                                <h5 className="modal-title" style={{ color: 'white' }}>Servicio Cancelado</h5>
                            </div>

                            <form style={{ marginTop: 3 }} >
                                <div className="row">
                                    <div className="col-md-3 mb-2">
                                        <label className="form-label">Fecha de registro</label>
                                        <input
                                            name="fecha_inicio"
                                            type='date'
                                            className="form-control form-control-sm"
                                            value={formData.fecha_inicio}
                                            readOnly
                                        />
                                    </div>

                                    <div className="col-md-3 mb-2">
                                        <label className="form-label">Fecha de cancelacion</label>
                                        <input
                                            name="fecha_inicio"
                                            type='date'
                                            className="form-control form-control-sm"
                                            value={formData.fecha_cancelacion}
                                            readOnly
                                        />

                                    </div>

                                    <div className="col-md-3 mb-2">
                                        <label className="form-label">Canceló</label>
                                        <input
                                            name="cancelo"
                                            type='text'
                                            className="form-control form-control-sm"
                                            value={formData.nombre}
                                            readOnly
                                        />

                                    </div>

                                    <div className="col-md-3 mb-2">
                                        <label className="form-label">Moto</label>
                                        <input
                                            type="text"
                                            name="idMoto"
                                            className="form-control form-control-sm"
                                            value={opcionesMotos.find(op => op.value === formData.idMoto)?.label || ""}
                                            readOnly
                                        />

                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-10 mb-2">
                                        <label className="form-label">Servicio(s)</label>
                                        <Select
                                            name="servicio"
                                            options={opcionesServicios}
                                            placeholder="SELECCIONA"
                                            isMulti
                                            value={opcionesServicios.filter(op => formData.servicio.includes(op.value))}
                                            isDisabled
                                        />

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
                                            type="text"
                                            name="idAutorizo"
                                            className="form-control form-control-sm"
                                            value={autorizaciones.find(op => op.value === formData.idAutorizo)?.label || ""}
                                            readOnly
                                        />

                                    </div>
                                    <div className="col-md-2 offset-md-6">
                                        <label className="form-label text-end d-block">Costo Total</label>
                                        <div className="input-group">
                                            <input
                                                type="text"
                                                name="costo_total"
                                                className="form-control"
                                                value={`$${(formData.costo_total || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
                                                readOnly
                                                style={{ textAlign: "right" }}
                                            />
                                        </div>
                                    </div>

                                </div>

                                <div className="col-md-12 mb-2">
                                    <label className="form-label">Comentario</label>
                                    <textarea
                                        name="comentario"
                                        className="form-control form-control-sm"
                                        value={formData.comentario}
                                        readOnly
                                    />
                                </div>

                                <div className="modal-footer">

                                    <Button
                                        type="button"
                                        style={{ backgroundColor: "#c0392b", color: "white", marginLeft: 7 }}
                                        onClick={onClose}
                                    >
                                        Cerrar
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
