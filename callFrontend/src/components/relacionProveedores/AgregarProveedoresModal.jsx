import { useState } from "react";
import { Button } from "@mui/material";
import { agregarProveedor } from "../../api/proovedoresApi";
import "../../styles/LoginScreen.css";

export const AgregarProveedoresModal = ({ onClose, modalOpen, agregarProveedorHandler }) => {
  if (!modalOpen) return null;

  const [formData, setFormData] = useState({
    nombre_empresa: "",
    nombre_proveedor: "",
    rfc: "",
    telefono_contacto: "",
    telefono_empresa: "",
    status: "1"
  });

  const [errors, setErrors] = useState({});

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
      if (!formData[key].trim()) {
        newErrors[key] = "Este campo es obligatorio";
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Eliminar espacios al final antes de enviar los datos
    const cleanedFormData = {
      ...formData,
      nombre_empresa: formData.nombre_empresa.trim(),
      nombre_proveedor: formData.nombre_proveedor.trim(),
      status: formData.status || "1",
    };

    if (!validateForm()) return;

    const result = await agregarProveedor(cleanedFormData);

    if (result?.error) {
      if (result.error.includes("Ya existe un proveedor con este nombre de empresa")) {
        setErrors((prev) => ({ ...prev, nombre_empresa: result.error }));
      } else {
        Swal.fire('Error', result.error, 'error');
      }
      return;
    }
    agregarProveedorHandler(cleanedFormData);
    onClose();

    setTimeout(() => {
      window.location.reload();  // Recarga la página
    }, 700);  // Tiempo en milisegundos (2 segundos de espera)
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
        <div className="modal-dialog" role="document" style={{ maxWidth: "50vw", marginTop: 90 }}>
          <div className="modal-content w-100" style={{ maxWidth: "50vw" }}>
            <div className="modal-header" style={{ backgroundColor: '#1f618d' }}>
              <h5 className="modal-title" style={{ color: 'white' }}>Agregar Proveedor</h5>
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
