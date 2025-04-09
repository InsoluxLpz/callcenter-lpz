import React, { useEffect, useState, useRef } from "react";
import { Button } from "@mui/material";
import { NavBar } from "../NavBar";
import Select from "react-select";
import { obtenerMotos } from "../../api/motosApi";
import { AgregarMantenimiento, ObtenerMantenimientos, ObtenerServicios, } from "../../api/ServiciosApi";
import { AgregarRefaccionesModal } from "./agregarRefaccionesModal";
import { cargarListasEntradas } from "../../api/almacenProductosApi";
import { useNavigate } from "react-router";
import { useSpring, animated } from "@react-spring/web";

export const RealizarMantenimiento = () => {
    const idUsuario = localStorage.getItem("idUsuario");

    const [formData, setFormData] = useState({
        fecha_inicio: new Date(),
        vehiculo: "",
        idAutorizo: "",
        odometro: "",
        servicio: [],
        costo_total: "",
        comentario: "",
    });

    const [errors, setErrors] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [motos, setMotos] = useState([]);
    const [autorizaciones, setAutorizaciones] = useState([]);
    const [servicio, setServicio] = useState([]);
    const [productosSeleccionados, setProductosSeleccionados] = useState([]);
    const motoRef = useRef(null);
    const servicioRef = useRef(null);
    const autorizoRef = useRef(null);

    const agregarProductoATabla = (productoData) => {
        setProductosSeleccionados((prevProductos) => {
            const productoExistente = prevProductos.find(
                (p) => p.producto === productoData.producto
            );

            let nuevosProductos;
            if (productoExistente) {
                nuevosProductos = prevProductos.map((p) =>
                    p.producto === productoData.producto
                        ? {
                            ...p,
                            cantidad: p.cantidad + productoData.cantidad,
                            subtotal:
                                (p.cantidad + productoData.cantidad) * p.costo_unitario,
                        }
                        : p
                );
            } else {
                nuevosProductos = [...prevProductos, productoData];
            }
            // Calcular el total
            const total = nuevosProductos.reduce(
                (acc, prod) => acc + prod.subtotal,
                0
            );
            // Formatear el total con dos decimales y agregarlo al estado
            const totalFormateado = total.toFixed(2);
            // Guardar en estado como número
            setFormData((prev) => ({
                ...prev,
                costo_total: parseFloat(totalFormateado),
            }));
            return nuevosProductos;
        });
    };

    const eliminarProductoDeTabla = (index) => {
        setProductosSeleccionados((prevProductos) => {
            const nuevosProductos = prevProductos.filter((_, i) => i !== index);

            // Calcular el nuevo costo total
            const total = nuevosProductos.reduce(
                (acc, prod) => acc + prod.subtotal,
                0
            );

            // Formatear el costo total con 2 decimales
            const formattedTotal = total.toFixed(2); // Esto asegura que tenga .00

            // Guardar en estado como número
            setFormData((prev) => ({
                ...prev,
                costo_total: parseFloat(formattedTotal),
            }));

            return nuevosProductos;
        });
    };

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    const fetchMotos = async () => {
        const data = await obtenerMotos();
        if (data) {
            const motosOrdenadas = data.sort((a, b) => a.inciso - b.inciso);
            setMotos(motosOrdenadas);
        }
    };

    const fetchAutorizo = async () => {
        const data = await cargarListasEntradas();
        if (data.autorizaciones) {
            setAutorizaciones(
                data.autorizaciones.map((a) => ({
                    value: a.idAutorizo,
                    label: a.nombre,
                }))
            );
        }
    };

    const opcionesVehiculos = motos.map((moto) => ({
        value: moto.id,
        label: moto.inciso,
    }));

    useEffect(() => {
        const cargarServicios = async () => {
            const data = await ObtenerServicios();
            console.log(data);

            if (data) {
                const serviciosFiltrados = data
                    .filter((serv) => serv.status !== 0)
                    .map((serv) => ({ value: serv.id, label: serv.nombre }));

                setServicio(serviciosFiltrados);
            }
        };

        cargarServicios();
        fetchMotos();
        fetchAutorizo();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "odometro" || name === "costo_total") {
            // Restringir solo a números
            const numericValue = value.replace(/[^\d]/g, "");

            // Si es costo_total, asegurarse de que tenga dos decimales
            if (name === "costo_total") {
                const formattedValue = parseFloat(numericValue).toFixed(2); // Aseguramos dos decimales
                setFormData((prev) => ({
                    ...prev,
                    [name]: parseFloat(formattedValue),
                }));
            } else {
                setFormData((prev) => ({ ...prev, [name]: parseFloat(numericValue) }));
            }
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }

        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const formatCurrency = (value) => {
        return value.toLocaleString("es-MX", {
            style: "currency",
            currency: "MXN",
        });
    };

    const validateForm = () => {
        const newErrors = {};

        Object.keys(formData).forEach((key) => {
            if (key === "comentario" || key === "odometro") return;

            const value = formData[key];

            if (Array.isArray(value)) {
                if (value.length === 0) {
                    newErrors[key] = "Este campo es obligatorio";
                }
            } else if (typeof value === "string" && value.trim() === "") {
                newErrors[key] = "Este campo es obligatorio";
            } else if (value === "" || value === null || value === undefined) {
                newErrors[key] = "Este campo es obligatorio";
            }
        });

        setErrors(newErrors);
        console.log("Errores de validación:", newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const nuevoMantenimiento = {
            fecha_inicio: formData.fecha_inicio,
            moto: formData.vehiculo,
            odometro: formData.odometro,
            costo: parseFloat(formData.costo_total) || 0,
            comentario: formData.comentario,
            idUsuario: idUsuario,
            idAutorizo: formData.idAutorizo,
            idCancelo: null,
            fecha_cancelacion: null,
            servicios: formData.servicio,
            productos: productosSeleccionados.map((prod) => ({
                idProducto: prod.id,
                cantidad: prod.cantidad,
                costo: parseFloat(prod.costo_unitario) || 0,
                subtotal: parseFloat(prod.subtotal) || 0,
            })),
        };

        const respuesta = await AgregarMantenimiento(nuevoMantenimiento);

        if (respuesta && !respuesta.error) {
            console.log("Mantenimiento agregado correctamente:", respuesta);

            setProductosSeleccionados([]);
            ObtenerMantenimientos();
            setErrors({});
            setTimeout(() => {
                window.location.reload();
            }, 700);
        } else {
            console.error("Error al agregar mantenimiento:", respuesta.error);
        }
    };

    const formatNumber = (value) => {
        return parseFloat(value).toLocaleString("es-MX");
    };

    useEffect(() => {
        const total = productosSeleccionados.reduce(
            (acc, prod) => acc + prod.subtotal,
            0
        );
        setFormData((prev) => ({ ...prev, costo_total: total }));
    }, [productosSeleccionados]);

    const getLocalDateTime = () => {
        const date = new Date();
        const offset = date.getTimezoneOffset();
        const localDate = new Date(date.getTime() - offset * 60000);
        return localDate.toISOString().slice(0, 16);
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

    // * diseño de carga en las tablas
    const styles = useSpring({
        from: { opacity: 0, transform: "translateY(50px)", filter: "blur(10px)" },
        to: { opacity: 1, transform: "translateY(0)", filter: "blur(0px)" },
        config: { tension: 500, friction: 30 },
    });

    const cleanCampos = () => {
        setFormData((prev) => ({
            ...prev,
            vehiculo: "",
            idAutorizo: "",
            odometro: "",
            servicio: [],
            costo_total: "",
            comentario: "",
        }));

        setProductosSeleccionados([]);
        setErrors({});
        setIsModalOpen(false); // Si aplica
    };

    return (
        <>
            <NavBar />
            <animated.div style={styles}>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        minHeight: "100vh",
                        backgroundColor: "#f2f3f4",
                        paddingTop: "2vh",
                        marginTop: 10,
                    }}
                >

                    <div
                        style={{
                            backgroundColor: "#ffffff",
                            padding: "15px",
                            borderRadius: "10px",
                            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                            maxWidth: "80vw",
                            width: "100%",
                        }}
                    >
                        <div
                            style={{
                                backgroundColor: "#1f618d",
                                padding: "10px",
                                borderRadius: "5px",
                            }}
                        >
                            <h5 style={{ color: "white", textAlign: "center", margin: 0 }}>
                                Realizar Mantenimiento
                            </h5>
                        </div>
                        <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
                            <div className="row">
                                <div className="col-md-3 mb-2">
                                    <label className="form-label">Fecha de inicio</label>
                                    <input
                                        id="fecha_inicio"
                                        name="fecha_inicio"
                                        type="datetime-local"
                                        className={`form-control form-control-sm ${errors.fecha_inicio ? "is-invalid" : ""
                                            }`}
                                        value={formData.fecha_inicio ? getLocalDateTime() : ""}
                                        onChange={handleChange}
                                        onKeyDown={(e) => handleKeyDown(e, motoRef, true)}
                                        readOnly
                                    />
                                </div>

                                <div className="col-md-4 mb-2">
                                    <label className="form-label">Moto</label>
                                    <Select
                                        key={formData.vehiculo}
                                        ref={motoRef}
                                        id="vehiculo"
                                        name="vehiculo"
                                        options={opcionesVehiculos}
                                        placeholder="SELECCIONA"
                                        value={opcionesVehiculos.find(
                                            (op) => op.value === formData.vehiculo
                                        )}
                                        onChange={(selectedOption) => {
                                            setFormData({
                                                ...formData,
                                                vehiculo: selectedOption.value,
                                            });
                                            setErrors((prev) => ({ ...prev, vehiculo: "" }));
                                        }}
                                        onKeyDown={(e) => handleKeyDown(e, "odometro")}
                                        styles={{
                                            control: (base) => ({
                                                ...base,
                                                minHeight: "45px",
                                                height: "45px",
                                            }),
                                            menuList: (provided) => ({
                                                ...provided,
                                                maxHeight: "200px",
                                                overflowY: "auto",
                                            }),
                                        }}
                                    />

                                    {errors.vehiculo && (
                                        <div className="text-danger">{errors.vehiculo}</div>
                                    )}
                                </div>

                                <div className="col-md-4 mb-2">
                                    <label className="form-label">Odómetro/Horómetro</label>
                                    <input
                                        id="odometro"
                                        type="text"
                                        name="odometro"
                                        className={`form-control form-control-sm ${errors.odometro ? "is-invalid" : ""
                                            }`}
                                        value={new Intl.NumberFormat("es-MX").format(
                                            formData.odometro
                                        )}
                                        onChange={handleChange}
                                        onKeyDown={(e) => handleKeyDown(e, servicioRef, true)}
                                    />
                                    {errors.odometro && (
                                        <div className="invalid-feedback">{errors.odometro}</div>
                                    )}
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-10 mb-2">
                                    <label className="form-label">Servicio(s)</label>
                                    <Select
                                        ref={servicioRef}
                                        id="servicio"
                                        name="servicio"
                                        options={[...servicio].sort((a, b) =>
                                            a.label.localeCompare(b.label)
                                        )}
                                        isMulti
                                        placeholder="SELECCIONA"
                                        value={formData.servicio
                                            .map((s) => {
                                                const serv = servicio.find((serv) => serv.value === s);
                                                return serv
                                                    ? { value: serv.value, label: serv.label }
                                                    : null;
                                            })
                                            .filter(Boolean)}
                                        onChange={(selectedOptions) => {
                                            const serviciosSeleccionados = selectedOptions
                                                ? selectedOptions.map((option) => option.value)
                                                : [];
                                            setFormData({
                                                ...formData,
                                                servicio: serviciosSeleccionados,
                                            });
                                            setErrors((prev) => ({ ...prev, servicio: "" }));
                                        }}
                                        onKeyDown={(e) => handleKeyDown(e, autorizoRef, true)}
                                        styles={{
                                            control: (base) => ({
                                                ...base,
                                                minHeight: "45px",
                                                height: "45px",
                                            }),
                                            menuList: (provided) => ({
                                                ...provided,
                                                maxHeight: "200px",
                                                overflowY: "auto",
                                            }),
                                        }}
                                    />
                                    {errors.servicio && (
                                        <div className="text-danger">{errors.servicio}</div>
                                    )}
                                </div>
                            </div>

                            <hr />
                            <div className="d-flex justify-content-end mb-3">
                                <Button
                                    variant="contained"
                                    color="primary"
                                    size="small"
                                    onClick={handleOpenModal}
                                >
                                    Agregar Refacción
                                </Button>
                            </div>

                            <h6 className="mb-2">
                                Desglose de Partes/Refacciones de Almacén
                            </h6>
                            <div className="table-responsive" style={{ maxHeight: "200px", overflowY: "auto" }}>
                                <table className="table" style={{ maxWidth: "80%", margin: "auto" }}>
                                    <thead>
                                        <tr>
                                            <th style={{ textAlign: "center", width: "15%" }}>Producto</th>
                                            <th style={{ textAlign: "right", width: "15%" }}>Costo Unitario</th>
                                            <th style={{ textAlign: "right", width: "15%" }}>Cantidad</th>
                                            <th style={{ textAlign: "right", width: "15%" }}>Subtotal</th>
                                            <th style={{ textAlign: "right", width: "15%" }}>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {productosSeleccionados.map((producto, index) => (
                                            <tr key={index}>
                                                <td style={{ textAlign: "center", width: "15%" }}>
                                                    {producto.producto}
                                                </td>
                                                <td style={{ textAlign: "right", width: "15%" }}>
                                                    ${formatNumber(producto.costo_unitario)}
                                                </td>
                                                <td style={{ textAlign: "right", width: "15%" }}>
                                                    {producto.cantidad}.00
                                                </td>
                                                <td style={{ textAlign: "right" }}>
                                                    ${formatNumber(producto.subtotal)}
                                                </td>
                                                <td style={{ textAlign: "right", width: "15%" }}>
                                                    <button
                                                        type="button"
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => eliminarProductoDeTabla(index)}
                                                    >
                                                        Eliminar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="row">
                                <div className="col-md-4 mb-2">
                                    <label className="form-label">Autorizó</label>
                                    <Select
                                        key={formData.idAutorizo}
                                        ref={autorizoRef}
                                        id="idAutorizo"
                                        name="idAutorizo"
                                        options={autorizaciones}
                                        value={autorizaciones.find(
                                            (option) => option.value === formData.idAutorizo
                                        )}
                                        placeholder="SELECCIONA"
                                        onChange={(selectedOption) => {
                                            setFormData({
                                                ...formData,
                                                idAutorizo: selectedOption.value,
                                            });
                                            setErrors((prev) => ({ ...prev, idAutorizo: "" }));
                                        }}
                                        onKeyDown={(e) => handleKeyDown(e, "costo_refacciones")}
                                        styles={{
                                            control: (base) => ({
                                                ...base,
                                                minHeight: "45px",
                                                height: "45px",
                                            }),
                                            menuList: (provided) => ({
                                                ...provided,
                                                maxHeight: "200px",
                                                overflowY: "auto",
                                            }),
                                        }}
                                    />
                                    {errors.idAutorizo && (
                                        <div className="text-danger">{errors.idAutorizo}</div>
                                    )}
                                </div>

                                <div className="col-md-2 offset-md-6">
                                    <label className="form-label text-end d-block">
                                        Costo Total
                                    </label>
                                    <div className="input-group">
                                        <input
                                            id="costo_refacciones"
                                            type="text"
                                            name="costo_refacciones"
                                            className="form-control"
                                            value={formatCurrency(formData.costo_total)}
                                            readOnly
                                            onKeyDown={(e) => handleKeyDown(e, "comentario")}
                                            style={{ textAlign: "right" }}
                                        />

                                        {errors.costo_total && (
                                            <div className="invalid-feedback">
                                                {errors.costo_total}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-12 mb-2 ">
                                <label className="form-label">Comentario</label>
                                <textarea
                                    id="comentario"
                                    name="comentario"
                                    type="text"
                                    className={`form-control form-control-sm`}
                                    value={formData.comentario}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="modal-footer">
                                <Button
                                    type="submit"
                                    style={{ backgroundColor: "#f1c40f", color: "white" }}
                                >
                                    Guardar
                                </Button>
                                <Button
                                    type="button"
                                    style={{
                                        backgroundColor: "#7f8c8d",
                                        color: "white",
                                        marginLeft: 7,
                                    }}
                                    onClick={cleanCampos}
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </form>
                        <AgregarRefaccionesModal
                            onClose={handleCloseModal}
                            modalOpen={isModalOpen}
                            agregarProductoATabla={agregarProductoATabla}
                        />
                    </div>
                </div>
            </animated.div>
        </>
    );
};
