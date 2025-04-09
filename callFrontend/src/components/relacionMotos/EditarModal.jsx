import { useEffect, useState, useRef } from "react";
import { ActualizarMoto } from "../../api/motosApi";
import { Button } from '@mui/material';
import '../../styles/LoginScreen.css';
import Select from "react-select";

export const EditarModal = ({ onClose, modalOpen, moto, actualizarLista, listaMarcas }) => {
    if (!modalOpen) return null;

    const marcas = listaMarcas;

    const formatFecha = (fecha) => {
        if (!fecha) return "";
        return fecha.split("T")[0];
    };

    const marcaRef = useRef(null);

    const [formData, setFormData] = useState({
        inciso: moto.inciso,
        idMarca: moto.idMarca,
        anio: moto.anio,
        modelo: moto.modelo,
        color: moto.color,
        motor: moto.motor,
        no_serie: moto.no_serie,
        placa: moto.placa,
        propietario: moto.propietario,
        fecha_compra: moto.fecha_compra,
        status: moto.status,
        nota: moto.nota,
    });

    const [errors, setErrors] = useState({})

    useEffect(() => {
        if (moto) {
            setFormData({
                inciso: moto.inciso || "",
                idMarca: moto.idMarca || "",
                anio: moto.anio || "",
                modelo: moto.modelo || "",
                color: moto.color || "",
                motor: moto.motor || "",
                no_serie: moto.no_serie || "",
                placa: moto.placa || "",
                propietario: moto.propietario || "",
                fecha_compra: formatFecha(moto.fecha_compra),
                status: moto.status || "",
                nota: moto.nota || "",
            });
            console.log(moto)
        }
    }, [moto]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if ((name === "inciso" || name === "anio") && value < 0) {
            cleanedValue = "0"; // Reemplazar con 0 si el número es negativo
        }


        const fieldsToClean = ["placa", "inciso", "no_serie"];
        let cleanedValue = value;
        if (fieldsToClean.includes(name)) {
            cleanedValue = value.replace(/\s+/g, "").trim();
        }

        setFormData((prev) => ({ ...prev, [name]: cleanedValue }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const opcionesMarcas = [...marcas]
        .sort((a, b) => a.nombre.localeCompare(b.nombre))
        .map((marca) => ({ value: marca.id, label: marca.nombre }));

    const validateForm = () => {
        const newErrors = {};

        Object.keys(formData).forEach((key) => {
            if (key !== "nota" && (formData[key] === "" || formData[key] === null || formData[key] === undefined)) {
                newErrors[key] = "Este campo es obligatorio";
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0; // Devuelve `true` si no hay errores
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        const updatedMoto = await ActualizarMoto(moto.id, formData);

        if (updatedMoto && updatedMoto.error) {
            // Si la API devuelve un error, verificamos si es un problema de duplicado
            const newErrors = {};

            if (updatedMoto.error.includes("El número de serie ya existe.")) {
                newErrors.no_serie = "Este número de serie ya está registrado.";
            }
            if (updatedMoto.error.includes("placa ya existe")) {
                newErrors.placa = "Esta placa ya está registrada.";
            }
            if (updatedMoto.error.includes("El inciso ya existe.")) {
                newErrors.inciso = "Este inciso ya está registrado.";
            }

            setErrors(newErrors);
            return;
        }

        if (updatedMoto) {
            e.preventDefault();
            actualizarLista(updatedMoto); // 🔹 Actualiza la tabla sin recargar
            onClose(); // 🔹 Cierra el modal
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
                <div className="modal-dialog" role="document" style={{ maxWidth: "60vw", marginTop: 90 }}>
                    <div className="modal-content w-100" style={{ maxWidth: "60vw" }}>
                        <div className="modal-header" style={{ backgroundColor: '#f1c40f' }}>
                            <h5 className="modal-title" style={{ color: 'white' }}>Editar Moto</h5>
                        </div>
                        <form onSubmit={handleSubmit} >
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-4 mb-3">
                                        <label className="form-label">Inciso</label>
                                        <input id="inciso" type="number" name="inciso" className={`form-control ${errors.inciso ? "is-invalid" : ""}`} value={formData.inciso} onChange={handleChange} onKeyDown={(e) => handleKeyDown(e, marcaRef, true)} />
                                        {errors.inciso && <div className="invalid-feedback">{errors.inciso}</div>}
                                    </div>
                                    <div className="col-md-4 mb-3">
                                        <label className="form-label">Marca</label>
                                        <Select
                                            ref={marcaRef}
                                            id="idMarca"
                                            name="idMarca"
                                            options={opcionesMarcas}
                                            placeholder="SELECCIONA"
                                            value={opcionesMarcas.find((op) => op.value === formData.idMarca)}
                                            isSearchable={true}
                                            onChange={(selectedOption) => setFormData({ ...formData, idMarca: selectedOption.value })}
                                            onKeyDown={(e) => handleKeyDown(e, "anio")}
                                            styles={{
                                                menuList: (provided) => ({
                                                    ...provided,
                                                    maxHeight: "200px", // Limita la altura del dropdow
                                                    overflowY: "auto",  // Habilita scroll si hay muchos elementos
                                                }),
                                                control: (base) => ({
                                                    ...base,
                                                    minHeight: "45px",
                                                    height: "45px",
                                                }),
                                            }}
                                        />
                                        {errors.marca && <div className="invalid-feedback">{errors.marca}</div>}
                                    </div>
                                    <div className="col-md-4 mb-3">
                                        <label className="form-label">Año</label>
                                        <input id="anio" type="number" name="anio" className={`form-control ${errors.anio ? "is-invalid" : ""}`} value={formData.anio} onChange={handleChange} onKeyDown={(e) => handleKeyDown(e, "modelo")} />
                                        {errors.anio && <div className="invalid-feedback">{errors.anio}</div>}
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-4 mb-3">
                                        <label className="form-label">Modelo</label>
                                        <input id="modelo" type="text" name="modelo" className={`form-control ${errors.modelo ? "is-invalid" : ""}`} value={formData.modelo} onChange={handleChange} onKeyDown={(e) => handleKeyDown(e, "color")} />
                                        {errors.modelo && <div className="invalid-feedback">{errors.modelo}</div>}
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <label className="form-label">Color</label>
                                        <input id="color" type="text" name="color" className={`form-control ${errors.color ? "is-invalid" : ""}`} value={formData.color} onChange={handleChange} onKeyDown={(e) => handleKeyDown(e, "no_serie")} />
                                        {errors.color && <div className="invalid-feedback">{errors.color}</div>}
                                    </div>
                                    <div className="col-md-4 mb-3">
                                        <label className="form-label">No. Serie</label>
                                        <input id="no_serie" type="text" name="no_serie" className={`form-control ${errors.no_serie ? "is-invalid" : ""}`} value={formData.no_serie} onChange={handleChange} onKeyDown={(e) => handleKeyDown(e, "motor")} />
                                        {errors.no_serie && <div className="invalid-feedback">{errors.no_serie}</div>}
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-4 mb-3">
                                        <label className="form-label">Motor</label>
                                        <input id="motor" type="text" name="motor" className={`form-control ${errors.motor ? "is-invalid" : ""}`} value={formData.motor} onChange={handleChange} onKeyDown={(e) => handleKeyDown(e, "placa")} />
                                        {errors.motor && <div className="invalid-feedback">{errors.motor}</div>}
                                    </div>
                                    <div className="col-md-4 mb-3">
                                        <label className="form-label">Placa</label>
                                        <input id="placa" type="text" name="placa" className={`form-control ${errors.placa ? "is-invalid" : ""}`} value={formData.placa} onChange={handleChange} onKeyDown={(e) => handleKeyDown(e, "propietario")} />
                                        {errors.placa && <div className="invalid-feedback">{errors.placa}</div>}
                                    </div>
                                    <div className="col-md-4 mb-3">
                                        <label className="form-label">Propietario</label>
                                        <input id="propietario" type="text" name="propietario" className={`form-control ${errors.propietario ? "is-invalid" : ""}`} value={formData.propietario} onChange={handleChange} onKeyDown={(e) => handleKeyDown(e, "fecha_compra")} />
                                        {errors.propietario && <div className="invalid-feedback">{errors.propietario}</div>}
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-4 mb-3">
                                        <label className="form-label">Fecha de Compra</label>
                                        <input id="fecha_compra" type="date" name="fecha_compra" onFocus={(e) => e.target.showPicker()} className={`form-control ${errors.fecha_compra ? "is-invalid" : ""}`} value={formData.fecha_compra} onChange={handleChange} onKeyDown={(e) => handleKeyDown(e, "status")} />
                                        {errors.fecha_compra && <div className="invalid-feedback">{errors.fecha_compra}</div>}
                                    </div>
                                    <div className="col-md-4 mb-3">
                                        <label className="form-label">Status</label>
                                        <select
                                            id="status"
                                            name="status"
                                            className={`form-control ${errors.status ? "is-invalid" : ""}`}
                                            value={formData.status}
                                            onChange={handleChange}
                                            onKeyDown={(e) => handleKeyDown(e, "nota")}
                                        >
                                            <option value="" disabled>Selecciona</option>
                                            <option value="1">Activa</option>
                                            <option value="3">Accidente o Tránsito</option>
                                            <option value="0">Inactiva</option>
                                            <option value="2">Taller</option>
                                        </select>
                                        {errors.status && <div className="invalid-feedback">{errors.status}</div>}
                                    </div>
                                </div>
                                <div>
                                    <div className="mb-3">
                                        <label className="form-label">Nota</label>
                                        <textarea id="nota" name="nota" className={`form-control`} value={formData.nota} onChange={handleChange}></textarea>
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