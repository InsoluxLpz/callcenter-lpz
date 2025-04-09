
import { Button } from "@mui/material";
import { obtenerProductos } from "../../api/productosApi";
import { useEffect, useState, useRef } from "react";
import Select from "react-select";
import { obtenerInventario } from "../../api/almacenProductosApi";

export const AgregarRefaccionesModal = ({ onClose, modalOpen, agregarProductoATabla }) => {
    if (!modalOpen) return null;

    const [formData, setFormData] = useState({
        producto: "",
        cantidad: "",
        precioTotal: 0,
    });

    const [refacciones, setRefacciones] = useState([]);
    const [inventario, setInventario] = useState([]);
    const [cantidadDisponible, setCantidadDisponible] = useState(null);
    const [errors, setErrors] = useState({});

    const inputCantidadRef = useRef(null);
    const selectProductoRef = useRef(null);

    useEffect(() => {
        const fetchProductos = async () => {
            const data = await obtenerProductos();
            if (data) {
                setRefacciones(data.sort((a, b) => a.nombre.localeCompare(b.nombre)));
            }
        };


        const fetchInventario = async () => {
            const data = await obtenerInventario();
            if (data) setInventario(data);
        };

        fetchProductos();
        fetchInventario();
    }, []);

    const handleProductoChange = (selectedOption) => {
        const productoSeleccionado = refacciones.find((p) => p.nombre === selectedOption?.value);
        if (!productoSeleccionado) return;

        // Buscar el inventario por nombreProducto en lugar de idProducto
        const itemInventario = inventario.find((inv) => inv.nombreProducto === productoSeleccionado.nombre);

        console.log("Producto seleccionado:", productoSeleccionado);
        console.log("Inventario encontrado:", itemInventario);

        setCantidadDisponible(itemInventario ? itemInventario.cantidad : 0);

        setFormData({
            ...formData,
            producto: selectedOption?.value || "",
            precioTotal: productoSeleccionado.precio * (formData.cantidad || 1),
        });

        inputCantidadRef.current?.focus();
    };


    const handleChange = (e) => {
        const { name, value } = e.target;

        // Si el usuario borra el input, establecerlo como una cadena vacía
        if (name === "cantidad" && value === "") {
            setFormData((prev) => ({
                ...prev,
                cantidad: "",
                precioTotal: 0, // Evita cálculos incorrectos con valores vacíos
            }));
            setErrors({});
            return;
        }

        const cantidadIngresada = Number(value);

        setFormData((prev) => ({
            ...prev,
            [name]: cantidadIngresada,
            precioTotal: name === "cantidad" ? prev.precioTotal * cantidadIngresada : prev.precioTotal
        }));

        if (cantidadDisponible !== null && cantidadIngresada > cantidadDisponible) {
            setErrors({ cantidad: "La cantidad ingresada supera el inventario disponible" });
        } else {
            setErrors({});
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.producto) newErrors.producto = "Elige un producto";
        if (!formData.cantidad || formData.cantidad <= 0) newErrors.cantidad = "Ingresa una cantidad válida";
        if (cantidadDisponible !== null && formData.cantidad > cantidadDisponible) {
            newErrors.cantidad = "No puedes agregar más productos de los que hay en inventario";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        const productoSeleccionado = refacciones.find((p) => p.nombre === formData.producto);
        if (!productoSeleccionado) return;

        const productoData = {
            id: productoSeleccionado.id,
            producto: formData.producto,
            cantidad: Number(formData.cantidad),
            costo_unitario: productoSeleccionado.precio,
            subtotal: productoSeleccionado.precio * Number(formData.cantidad),
        };

        agregarProductoATabla(productoData);

        setFormData({ producto: "", cantidad: "", precioTotal: 0 });
        setCantidadDisponible(null);
        setErrors({});

        setTimeout(() => {
            selectProductoRef.current?.focus();
        }, 100);
    };

    return (
        <div className="modal-backdrop">
            <div className="modal fade show" style={{ display: "block" }} aria-labelledby="exampleModalLabel" tabIndex="-1" role="dialog">
                <div className="modal-dialog" role="document" style={{ maxWidth: "20vw", marginTop: 90 }}>
                    <div className="modal-content w-90" style={{ maxWidth: "60vw" }}>
                        <div className="modal-header" style={{ backgroundColor: '#1f618d' }}>
                            <h5 className="modal-title" style={{ color: 'white' }}>Agregar Mantenimiento</h5>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-12 mb-3">
                                        <label className="form-label">Artículo del almacén</label>
                                        <Select
                                            ref={selectProductoRef}
                                            name="producto"
                                            classNamePrefix="select"
                                            options={refacciones
                                                .filter((prod) => prod.status !== 0) // Filtra los productos con status diferente de 0
                                                .map((prod) => ({
                                                    value: prod.nombre,
                                                    label: `${prod.nombre}`
                                                }))
                                            }
                                            value={formData.producto ? { value: formData.producto, label: formData.producto } : null}
                                            onChange={handleProductoChange}
                                            styles={{
                                                control: (base) => ({
                                                    ...base,
                                                    minHeight: "45px",
                                                    height: "45px",
                                                }),
                                                menuList: (provided) => ({
                                                    ...provided,
                                                    maxHeight: "170px",
                                                    overflowY: "auto",
                                                }),
                                            }}
                                            isSearchable={true}
                                            placeholder="SELECCIONA"
                                        />

                                        {errors.producto && <div className="invalid-feedback">{errors.producto}</div>}
                                    </div>

                                    {/* {cantidadDisponible !== null && (
                                        <div className="col-md-12 mb-3">
                                            <label className="form-label">Cantidad en Almacén:</label>
                                            <input type="text" className="form-control" value={cantidadDisponible} disabled />
                                        </div>
                                    )} */}

                                    {/* Cantidad */}
                                    <div className="col-md-12 mb-3">
                                        <label className="form-label">Cantidad</label>
                                        <input
                                            type="number"
                                            name="cantidad"
                                            className={`form-control ${errors.cantidad ? "is-invalid" : ""}`}
                                            onChange={handleChange}
                                            value={formData.cantidad} // Ahora puede estar vacío sin volverse 0
                                            ref={inputCantidadRef}
                                        />
                                        {errors.cantidad && <div className="invalid-feedback">{errors.cantidad}</div>}
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <Button type="submit" style={{ backgroundColor: "#f1c40f", color: "white" }} disabled={!!errors.cantidad}>
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
