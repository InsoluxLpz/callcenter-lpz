import { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { actualizarProovedor } from "../../api/proovedoresApi";
import "../../styles/LoginScreen.css";
import Swal from "sweetalert2";

export const EditarProveedoresModal = ({ onClose, modalOpen, proveedor, actualizarLista, ListaProveedor }) => {
  if (!modalOpen) return null;

  const Proveedores = ListaProveedor;

  const [formData, setFormData] = useState({
    nombre_empresa: proveedor.nombre_empresa,
    nombre_proveedor: proveedor.nombre_proveedor,
    rfc: proveedor.rfc,
    telefono_contacto: proveedor.telefono_contacto,
    telefono_empresa: proveedor.telefono_empresa,
    status: proveedor.status
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (proveedor) {
      setFormData({
        nombre_empresa: proveedor.nombre_empresa || "",
        nombre_proveedor: proveedor.nombre_proveedor || "",
        rfc: proveedor.rfc || "",
        telefono_contacto: proveedor.telefono_contacto || "",
        telefono_empresa: proveedor.telefono_empresa || "",
        status: proveedor.status || ""
      });
    }
    console.log(proveedor)
  }, [proveedor]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Validar si el campo es un número de teléfono y si el valor es negativo
    if ((name === "telefono_contacto" || name === "telefono_empresa") && Number(value) < 0) {
      return; // No permite establecer valores negativos
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const value = formData[key];

      // Si el campo es "status", lo ignoramos en la validación
      if (key === "status") return;

      if (typeof value === "string" && !value.trim()) {
        newErrors[key] = "Este campo es obligatorio";
      } else if (value === "") {
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
      nombre_empresa: formData.nombre_empresa.trim(),
    };

    setFormData(cleanedFormData);

    // Validar si el nombre de la empresa ya existe en los proveedores
    const nombreProveedorExistente = Proveedores.find(
      (prov) => prov.nombre_empresa.toLowerCase() === cleanedFormData.nombre_empresa.toLowerCase() && prov.id !== proveedor.id
    );

    if (nombreProveedorExistente) {
      setErrors((prev) => ({
        ...prev,
        nombre_empresa: "Ya existe un proveedor con ese nombre de empresa",
      }));
      return;
    }

    if (!validateForm()) return;

    try {
      const updateProveedor = await actualizarProovedor(proveedor.id, cleanedFormData);
      console.log("Proveedor actualizado:", updateProveedor);
      if (updateProveedor?.error) {
        setErrors({ general: "Error al actualizar el proveedor" });
        return;
      }
      Swal.fire("Éxito", "Proveedor actualizado correctamente.", "success");

      // Llamada para actualizar el proveedor en la lista
      actualizarLista(updateProveedor);
      onClose();
      console.log("Proveedor actualizado", updateProveedor);
    } catch (error) {
      console.error("Error al actualizar:", error);
      setErrors({ general: "Error al conectar con el servidor" });
    }
  };

  const handleKeyDown = (e, nextField) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Evita que el formulario se envíe
      document.getElementById(nextField)?.focus(); // Mueve el cursor al siguiente campo
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal fade show" style={{ display: "block" }} aria-labelledby="exampleModalLabel" tabIndex="-1" role="dialog">
        <div className="modal-dialog" role="document" style={{ maxWidth: "50vw", marginTop: 90 }}>
          <div className="modal-content w-100" style={{ maxWidth: "50vw" }}>
            <div className="modal-header" style={{ backgroundColor: '#f1c40f' }}>
              <h5 className="modal-title" style={{ color: 'white' }}>Editar Proveedor</h5>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Empresa</label>
                    <input
                      id="nombre_empresa"
                      type="text"
                      name="nombre_empresa"
                      className={`form-control ${errors.nombre_empresa ? "is-invalid" : ""
                        }`}
                      value={formData.nombre_empresa}
                      onChange={handleChange}
                      onKeyDown={(e) => handleKeyDown(e, "nombre_proveedor")}
                    />
                    {errors.nombre_empresa && (
                      <div className="invalid-feedback">
                        {errors.nombre_empresa}
                      </div>
                    )}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Contacto</label>
                    <input
                      id="nombre_proveedor"
                      type="text"
                      name="nombre_proveedor"
                      className={`form-control ${errors.nombre_proveedor ? "is-invalid" : ""
                        }`}
                      value={formData.nombre_proveedor}
                      onChange={handleChange}
                      onKeyDown={(e) => handleKeyDown(e, "telefono_contacto")}
                    />
                    {errors.nombre_proveedor && (
                      <div className="invalid-feedback">
                        {errors.nombre_proveedor}
                      </div>
                    )}
                  </div>
                </div>


                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Teléfono de Contacto</label>
                    <input
                      id="telefono_contacto"
                      type="number"
                      name="telefono_contacto"
                      className={`form-control ${errors.telefono_contacto ? "is-invalid" : ""
                        }`}
                      value={formData.telefono_contacto}
                      onChange={handleChange}
                      onKeyDown={(e) => handleKeyDown(e, "rfc")}
                    />
                    {errors.telefono_contacto && (
                      <div className="invalid-feedback">
                        {errors.telefono_contacto}
                      </div>
                    )}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">RFC</label>
                    <input
                      id="rfc"
                      type="text"
                      name="rfc"
                      className={`form-control ${errors.rfc ? "is-invalid" : ""}`}
                      value={formData.rfc}
                      onChange={handleChange}
                      onKeyDown={(e) => handleKeyDown(e, "telefono_empresa")}
                    />
                    {errors.rfc && (
                      <div className="invalid-feedback">{errors.rfc}</div>
                    )}
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Teléfono de la Empresa</label>
                    <input
                      id="telefono_empresa"
                      type="number"
                      name="telefono_empresa"
                      className={`form-control ${errors.telefono_empresa ? "is-invalid" : ""
                        }`}
                      value={formData.telefono_empresa}
                      onChange={handleChange}
                      onKeyDown={(e) => handleKeyDown(e, "status")}
                    />
                    {errors.telefono_empresa && (
                      <div className="invalid-feedback">
                        {errors.telefono_empresa}
                      </div>
                    )}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">¿Desea reactivar el proveedor?</label>
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
                <Button
                  type="submit"
                  style={{ backgroundColor: "#f1c40f", color: "white" }}
                  onClick={handleSubmit}
                >
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
  );
};
