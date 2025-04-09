import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Modal,
  styled,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FeedIcon from "@mui/icons-material/Feed";
import { useNavigate } from "react-router";
import { NavBar } from "../NavBar";
import {
  cargarListasMovimientosXProductosDetalles,
  obtenerTodosLosProductos,
} from "../../api/almacenProductosApi";
import { ModalMovProductoDetalle } from "./ModalMovProductoDetalle"; // Importar el modal
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
// * componente para el indicador de carga
import IndicadorCarga from "../IndicadorCarga";
import { useSpring, animated } from "@react-spring/web";
import Swal from "sweetalert2";

export const MovXProductosTable = () => {
  const navigate = useNavigate();
  const [inventario, setInventario] = useState([]);
  const [filtro, setFiltro] = useState({
    idMovimiento: "",
    fechaInicio: "",
    fechaFin: "",
    nombreUsuario: "",
    idProducto: "",
  });

  const [openSearchModal, setOpenSearchModal] = useState(false);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [detalleMovimiento, setDetalleMovimiento] = useState(null);
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  // * indicador de progreso en carga de tabla
  const [progreso, setProgreso] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // * cargamos la lista de productos al montar el componente
  useEffect(() => {
    fetchProductos();
  }, []);

  // * Función para obtener productos
  const fetchProductos = async () => {
    try {
      const data = await obtenerTodosLosProductos();
      if (data && data.length > 0) {
        setProductos(data);
      } else {
        Swal.fire("Atención", "No hay productos disponibles.", "warning");
      }
    } catch (error) {
      console.error("Error al obtener productos:", error);
      Swal.fire("Error", "No se pudieron cargar los productos.", "error");
    }
  };

  // * peticion con el indicador de car4ga
  const fetchInventario = async () => {
    try {
      setIsLoading(true); // Inicia el indicador de carga
      setInventario([]); // Limpia los datos previos antes de agregar nuevos
      const data = await cargarListasMovimientosXProductosDetalles(
        filtro.idProducto,
        filtro.fechaInicio,
        filtro.fechaFin
      );

      if (data) {
        const sortedData = data.sort((a, b) => a.idDetalle - b.idDetalle);
        setInventario(sortedData);
      }
    } catch (error) {
      console.error("Error en la petición al obtener Inventario:", error);
    } finally {
      setIsLoading(false); // Finaliza el indicador de carga
      setProgreso(100);
      setTimeout(() => setProgreso(0), 500); // Oculta el indicador después de un pequeño retraso
    }
  };


  // * Selección de producto desde el modal
  const handleSelectProducto = (idProducto) => {
    setFiltro({ ...filtro, idProducto });
    setOpenSearchModal(false);
  };

  // * Abrir modal de detalles
  const handleOpenDetailModal = (producto) => {
    setDetalleMovimiento(producto);
    setOpenDetailModal(true);
  };

  const handleFiltroChange = (e) => {
    setFiltro({ ...filtro, [e.target.name]: e.target.value });
  };

  const handleOpenModal = (producto) => {
    setDetalleMovimiento(producto);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setDetalleMovimiento(null);
  };

  // * funcion para limpiar el filtro
  const limpiarFiltros = () => {
    setFiltro({
      idMovimiento: "",
      fechaInicio: "",
      fechaFin: "",
      nombreUsuario: "",
      idProducto: "",
    });
    setInventario([]); // Opcional: limpiar la tabla también
  };

  // * diseño de carga en las tablas
  const styles = useSpring({
    from: { opacity: 0, transform: "translateY(50px)", filter: "blur(10px)" },
    to: { opacity: 1, transform: "translateY(0)", filter: "blur(0px)" },
    config: { tension: 500, friction: 30 },
  });

  return (
    <>
      <NavBar />

      <animated.div style={styles}>
        <Box display="flex" justifyContent="center" gap={1} my={2} mt={3}>
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#566573",
              color: "white",
              ":hover": { opacity: 0.7 },
              borderRadius: "8px",
              padding: "5px 10px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
            onClick={limpiarFiltros}
          >
            <CleaningServicesIcon sx={{ fontSize: 24 }} />
          </Button>
          <TextField
            label="Fecha Inicio"
            name="fechaInicio"
            type="date"
            value={filtro.fechaInicio}
            onChange={handleFiltroChange}
            InputLabelProps={{ shrink: true }}
            onFocus={(e) => e.target.showPicker()}
          />
          <TextField
            label="Fecha Fin"
            name="fechaFin"
            type="date"
            value={filtro.fechaFin}
            onChange={handleFiltroChange}
            InputLabelProps={{ shrink: true }}
            onFocus={(e) => e.target.showPicker()}
          />

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel id="producto-label">Producto</InputLabel>
            <Select
              labelId="producto-label"
              name="idProducto"
              value={filtro.idProducto || ""}
              onChange={handleFiltroChange}
              displayEmpty
              label="Productos" // Esto asegura que la etiqueta esté vinculada correctamente
            >
              {productos.map((producto) => (
                <MenuItem key={producto.idProducto} value={producto.idProducto}>
                  {producto.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button variant="contained" color="primary" onClick={fetchInventario}>
            Buscar
          </Button>
        </Box>

        <Box width="85%" maxWidth={1500} margin="0 auto" mt={2}>
          <Box
            sx={{
              backgroundColor: "#1f618d",
              padding: "10px 20px",
              borderRadius: "8px 8px 0 0",
            }}
          >
            <Typography variant="h5" fontWeight="bold" color="white">
              Movimientos por producto
            </Typography>
          </Box>
          <Paper sx={{ width: "100%" }}>
            <TableContainer sx={{ maxHeight: 600, backgroundColor: "#eaeded" }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    {[
                      "No. movimiento",
                      "Fecha",
                      "Producto",
                      "Tipo de movimiento",
                      "Subtipo",
                      "Existencia anterior",
                      "Cantidad",
                      "Existencia posterior",
                      "Realizó Movimiento",
                      "Detalles",
                    ].map((header) => (
                      <TableCell
                        key={header}
                        align="left"
                        sx={{
                          fontWeight: "bold",
                          backgroundColor: "#f4f6f7",
                          color: "black",
                          minWidth: 1,
                        }}
                      >
                        {header}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {inventario.map((producto) => (
                    <TableRow key={producto.idMovimiento}>
                      <TableCell align="left">
                        {producto.idDetalle}
                      </TableCell>
                      <TableCell align="left">
                        {new Date(producto.fecha_movimiento).toLocaleDateString(
                          "es-MX"
                        )}
                      </TableCell>
                      <TableCell align="left">
                        {producto.nombreProducto}
                      </TableCell>
                      <TableCell align="left">
                        {producto.tipoMovimiento}
                      </TableCell>
                      <TableCell align="left">
                        {producto.tipoSubMovimiento}
                      </TableCell>
                      <TableCell align="left">
                        {producto.existencia_anterior}
                      </TableCell>
                      <TableCell align="left">{producto.cantidad}</TableCell>
                      <TableCell align="left">
                        {producto.existencia_nueva}
                      </TableCell>
                      <TableCell align="left">
                        {producto.nombreUsuario}
                      </TableCell>
                      <TableCell align="left">
                        <IconButton
                          sx={{ color: "black" }}
                          onClick={() => handleOpenModal(producto)}
                        >
                          <FeedIcon sx={{ fontSize: 29 }} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <IndicadorCarga progreso={progreso} cargando={isLoading} />
          </Paper>
        </Box>

        {/* Modal */}
        <ModalMovProductoDetalle
          open={openModal}
          handleClose={handleCloseModal}
          detalle={detalleMovimiento}
        />
      </animated.div>
    </>
  );
};
