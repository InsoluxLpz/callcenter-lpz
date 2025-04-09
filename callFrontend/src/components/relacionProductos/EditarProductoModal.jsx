import { useEffect, useState, useRef } from "react";
import { actualizarProductos } from "../../api/productosApi";
import { Button } from "@mui/material";
import Select from "react-select";
import Swal from "sweetalert2";

export const EditarProductoModal = ({ onClose, modalOpen, producto, actualizarLista, listagrupos, unidadMedida, ListaProveedores, ListaProductos }) => {
  if (!modalOpen) return null;

  const grupos = listagrupos;
  const unidad = unidadMedida;
  const Proveedor = ListaProveedores;
  const Productos = ListaProductos;

  console.log(Proveedor)

  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    grupo: "",
    unidad_medida: "",
    precio: "",
    descripcion: "",
    proveedores: [],
    status: 1,
  });

  const [errors, setErrors] = useState({});
  const marcaRef = useRef(null);
  const unidadRef = useRef(null);
  const proveedoresRef = useRef(null);

  useEffect(() => {
    if (producto && ListaProveedores.length > 0) {
      console.log("Producto cargado:", producto);

      setFormData({
        codigo: producto.codigo || "",
        nombre: producto.nombre || "",
        grupo: producto.idGrupo || "",
        unidad_medida: producto.idUnidadMedida || "",
        precio: producto.precio || "",
        descripcion: producto.descripcion || "",
        status: producto.status || "",
        proveedores: producto.proveedores
          ? producto.proveedores.map(prov => {
            const proveedorEncontrado = ListaProveedores.find(p => p.id === prov.id);
            return {
              value: prov.id,
              label: proveedorEncontrado ? proveedorEncontrado.nombre_empresa : "Proveedor no disponible"
            };
          })
          : [],
      });
    }
  }, [producto, ListaProveedores]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === "codigo" || name === "nombre") {
      newValue = value.replace(/^\s+/, "");
    }
    setFormData((prev) => ({ ...prev, [name]: newValue }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};

    Object.keys(formData).forEach((key) => {
      if (key !== "descripcion") {
        if (!formData[key]?.toString().trim()) {
          newErrors[key] = "Este campo es obligatorio";
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanedFormData = {
      ...formData,
      codigo: formData.codigo.trim(),
      nombre: formData.nombre.trim()
    };

    setFormData(cleanedFormData);

    if (!validateForm()) return;

    const productoExistenteNombre = Productos.find(
      (prod) =>
        prod.nombre.toLowerCase() === cleanedFormData.nombre.toLowerCase() &&
        prod.id !== producto.id
    );

    if (productoExistenteNombre) {
      setErrors((prev) => ({
        ...prev,
        nombre: "Ya existe un producto con ese nombre",
      }));
      return;
    }

    const productoExistenteCodigo = Productos.find(
      (prod) =>
        prod.codigo.toLowerCase() === cleanedFormData.codigo.toLowerCase() &&
        prod.id !== producto.id
    );

    if (productoExistenteCodigo) {
      setErrors((prev) => ({
        ...prev,
        codigo: "Ya existe un producto con este código",
      }));
      return;
    }

    const idUsuario = parseInt(localStorage.getItem('idUsuario'), 10);

    if (isNaN(idUsuario)) {
      setErrors((prev) => ({ ...prev, general: "Error: Usuario no identificado" }));
      return;
    }

    const formDataProcessed = {
      ...cleanedFormData,
      idUsuario,
      proveedores: formData.proveedores.map((proveedor) => proveedor.value),
    };

    try {
      const updatedProducto = await actualizarProductos(producto.id, formDataProcessed);
      if (updatedProducto?.error) {
        setErrors({ general: "Error al actualizar el producto" });
        return;
      }

      Swal.fire("Éxito", "Producto actualizado correctamente.", "success");

      actualizarLista(updatedProducto);

      setTimeout(() => onClose(), 300);

    } catch (error) {
      console.error("Error al actualizar:", error);
      setErrors({ general: "Error al conectar con el servidor" });
    }
  };

  const formatCurrency = (value) => {
    if (value) {
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
      }).format(value);
    }
    return '$0.00';  // Valor por defecto si no hay valor
  };

  const opcionesGrupos = [...grupos]
    .sort((a, b) => a.nombre.localeCompare(b.nombre))
    .map((grupo) => ({ value: grupo.id, label: grupo.nombre }));

  const opcionesUnidad = [...unidad]
    .sort((a, b) => a.nombre.localeCompare(b.nombre))
    .map((uni) => ({ value: uni.id, label: uni.nombre }));

  const opcioneProveedor = Proveedor
    .filter(prov => prov.status !== 0)
    .map(prov => ({ value: prov.id, label: prov.nombre_empresa }));

  const handleKeyDown = (e, nextField, isSelect = false) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (isSelect && nextField.current) {
        nextField.current.focus();
      } else {
        document.getElementById(nextField)?.focus();
      }
    }
  }

  return (
    <>
      <div className="modal-backdrop">
        <div className="modal fade show" style={{ display: "block" }} aria-labelledby="exampleModalLabel" tabIndex="-1" role="dialog">
          <div className="modal-dialog" role="document" style={{ maxWidth: "60vw", marginTop: 90 }}>
            <div className="modal-content w-100" style={{ maxWidth: "60vw" }}>
              <div className="modal-header" style={{ backgroundColor: '#f1c40f' }}>
                <h5 className="modal-title" style={{ color: 'white' }}>Editar Producto</h5>
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
                      {errors.codigo && (
                        <div className="invalid-feedback">{errors.codigo}</div>
                      )}
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
                      {errors.nombre && (
                        <div className="invalid-feedback">{errors.nombre}</div>
                      )}
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Grupo</label>
                      <Select
                        ref={marcaRef}
                        id="grupo"
                        name="grupo"
                        options={opcionesGrupos}
                        placeholder="SELECCIONA"
                        value={opcionesGrupos.find((op) => op.value === formData.grupo)}
                        isSearchable={true}
                        onChange={(selectedOption) => setFormData({ ...formData, grupo: selectedOption.value })}
                        onKeyDown={(e) => handleKeyDown(e, "precio")}
                        styles={{
                          menuList: (provided) => ({
                            ...provided,
                            maxHeight: "200px",
                            overflowY: "auto",
                          }),
                          control: (base) => ({
                            ...base,
                            minHeight: "45px",
                            height: "45px",
                          }),
                        }}
                      />
                      {errors.grupo && (
                        <div className="invalid-feedback">{errors.grupo}</div>
                      )}
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Unidad de Medida</label>
                      <Select
                        ref={unidadRef}
                        id='unidad_medida'
                        name="unidad_medida"
                        options={opcionesUnidad}
                        placeholder="SELECCIONA"
                        value={opcionesUnidad.find((um) => um.value === formData.unidad_medida)}
                        isSearchable={true}
                        onChange={(selectedOption) => setFormData({ ...formData, unidad_medida: selectedOption.value })}
                        onKeyDown={(e) => handleKeyDown(e, proveedoresRef, true)}
                        styles={{
                          menuList: (provided) => ({
                            ...provided,
                            maxHeight: "200px", // Limita la altura del dropdown
                            overflowY: "auto",  // Habilita scroll si hay muchos elementos
                          }),
                          control: (base) => ({
                            ...base,
                            minHeight: "45px",
                            height: "45px",
                          }),
                        }}
                      />
                      {errors.unidad_medida && (
                        <div className="invalid-feedback">{errors.unidad_medida}</div>
                      )}
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Proveedor</label>
                      <Select
                        ref={proveedoresRef}
                        id='unidad_medida'
                        name="proveedores"
                        options={opcioneProveedor}
                        placeholder="SELECCIONA"
                        value={formData.proveedores}
                        isMulti
                        isSearchable={true}
                        onChange={(selectedOptions) => {
                          setFormData({
                            ...formData,
                            proveedores: selectedOptions || []
                          });
                        }}
                        onKeyDown={(e) => handleKeyDown(e, "status")}
                      />

                      {errors.proveedores && (
                        <div className="text-danger small">{errors.proveedores}</div>
                      )}
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Activar/Desactivar producto</label>
                      <select
                        id="status"
                        name="status"
                        className={`form-control ${errors.status ? "is-invalid" : ""}`}
                        value={formData.status}  // Asegúrate de que `formData.status` proviene de la BD
                        onChange={handleChange}
                        onKeyDown={(e) => handleKeyDown(e, "descripcion")}
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

                  <div className="col-md-12 mb-3">
                    <label className="form-label">Descripción</label>
                    <textarea
                      id="descripcion"
                      name="descripcion"
                      className={`form-control ${errors.descripcion ? "is-valid" : ""
                        }`}
                      value={formData.descripcion}
                      onChange={handleChange}
                    ></textarea>
                  </div>
                </div>

                {/* Botones */}
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
        </div >
      </div >
    </>
  );
};