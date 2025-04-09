import React, { useState, useEffect } from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import {
  Box,
  Button,
  Typography,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { NavBar } from "../NavBar";
import {
  cargarListasEntradas,
  cargarListasMovimientos,
} from "../../api/almacenProductosApi";
import { ModalMovimientosDetalles } from "./ModalMovimientosDetalles";
import { useSpring, animated } from "@react-spring/web";
import FeedIcon from "@mui/icons-material/Feed";
import { EditarProductoAlmacenModal } from "./EditarProductoAlmacenModal";
import { useNavigate } from "react-router";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";

export const MovimientosAlmacenTable = () => {
  const navigate = useNavigate();

  const [openModalEditar, setOpenModalEditar] = useState(false);
  const [openModalAgregar, setOpenModalAgregar] = useState(false);
  const [inventario, setInventario] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showInactive, setShowInactive] = useState(false);

  // * modal movimientos detalles
  const [openModal, setOpenModal] = useState(false);
  const [selectedMovimiento, setSelectedMovimiento] = useState(null);

  // * filtros por paginacion
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Límite por página (puedes cambiarlo dinámicamente si es necesario)
  const [totalPages, setTotalPages] = useState(1); // Total de páginas (calculado desde el backend)

  // * estados de filtro
  const [tipoMovimiento, setTiposMovimiento] = useState([]);
  const [subMovimiento, setSubMovimientos] = useState([]);

  // * filtro por idMovimiento, Fecha y quien realizo el movimiento
  const [filtro, setFiltro] = useState({
    fechaInicio: "",
    fechaFin: "",
    tipoMovimiento: "",
    subMovimiento: "",
  });

  const handleOpenModal = (id) => {
    setSelectedMovimiento(id);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedMovimiento(null);
  };

  // * manejo del cambio de pagina
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      fetchInventario(filtro.fechaInicio, filtro.fechaFin, newPage); // Asegúrate de pasar los valores correctos
    }
  };

  // * cargar los movimientos de la semana
  useEffect(() => {
    const today = new Date();
    const firstDayOfWeek = new Date(
      today.setDate(today.getDate() - today.getDay())
    );
    const lastDayOfWeek = new Date(
      today.setDate(today.getDate() - today.getDay() + 6)
    );

    const fechaInicio = firstDayOfWeek.toISOString().split("T")[0];
    const fechaFin = lastDayOfWeek.toISOString().split("T")[0];

    setFiltro({ ...filtro, fechaInicio, fechaFin });
    fetchInventario(fechaInicio, fechaFin); // Llama a la función para cargar los movimientos inicialmente
    fetch;
  }, []); // Esto solo se ejecutará una vez al cargar el componente.

  // * estos son los parametros que enviaremos
  const fetchInventario = async (
    fechaInicio,
    fechaFin,
    page = 1,
    limit = 50,
    tipoMovimiento = "", // Añadir tipoMovimiento
    subMovimiento = "" // Añadir subMovimiento
  ) => {
    try {
      const data = await cargarListasMovimientos(
        fechaInicio,
        fechaFin,
        page,
        limit,
        tipoMovimiento, // Pasar el tipoMovimiento al backend
        subMovimiento // Pasar el subMovimiento al backend
      );

      console.log("data", data);
      if (data && data.data) {
        setInventario(data.data);
        const totalRecords = data.meta.total || 0;
        setTotalPages(Math.ceil(totalRecords / limit));
      }
    } catch (error) {
      console.error("Error en la petición al obtener Inventario", error);
    }
  };

  // * funcion para cargar los tipos de movimientos y subtipos en el select
  useEffect(() => {
    const cargarListas = async () => {
      try {
        const data = await cargarListasEntradas();
        if (data.tipoMovimiento) {
          setTiposMovimiento(
            data.tipoMovimiento.map((m) => ({
              value: m.idMovimiento,
              label: m.movimiento,
            }))
          );
        }
        if (data.tiposEntrada) {
          setSubMovimientos(
            data.tiposEntrada.map((t) => ({
              value: t.id,
              label: t.tipoSubMovimiento,
            }))
          );
        }
        console.log("data tm", data.tipoMovimiento);
        console.log("data sm", data.tiposEntrada);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      }
    };
    cargarListas();
  }, []);

  // * funcion para actualizar la tabla
  const actualizarLista = (productoActualizado) => {
    setInventario((prevInventario) =>
      prevInventario.map((item) =>
        item.id === productoActualizado.id ? productoActualizado : item
      )
    );
  };

  // * funcion para los filtros
  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltro((prev) => ({ ...prev, [name]: value }));
  };

  const handleFiltroSearch = () => {
    fetchInventario(
      filtro.fechaInicio,
      filtro.fechaFin,
      1,
      50,
      filtro.tipoMovimiento,
      filtro.subMovimiento
    );
  };

  const movimientosFiltrados = inventario.filter((m) => {
    const fechaInicioMatch =
      !filtro.fechaInicio || m.fecha_movimiento >= filtro.fechaInicio;

    const fechaFinMatch =
      !filtro.fechaFin || m.fecha_movimiento <= filtro.fechaFin;

    const tipoMovimientoMatch =
      !filtro.tipoMovimiento ||
      (typeof filtro.tipoMovimiento === "string" &&
        m.tipoMovimiento
          ?.toLowerCase()
          .includes(filtro.tipoMovimiento.toLowerCase().trim()));

    const subMovimientoMatch =
      !filtro.subMovimiento ||
      (typeof filtro.subMovimiento === "string" &&
        m.subMovimiento
          ?.toLowerCase()
          .includes(filtro.subMovimiento.toLowerCase().trim()));

    return (
      fechaInicioMatch &&
      fechaFinMatch &&
      tipoMovimientoMatch &&
      subMovimientoMatch
    );
  });

  const limpiarFiltros = () => {
    window.location.reload();
  };

  // * estilo de navegacion al componente
  const styles = useSpring({
    from: { opacity: 0, transform: "translateY(50px)", filter: "blur(10px)" },
    to: { opacity: 1, transform: "translateY(0)", filter: "blur(0px)" },
    config: { tension: 500, friction: 30 },
  });

  // * funcion para la relacion en los tipos de movimientos con los subtipos
  // * función para actualizar los subtipos de acuerdo al tipo de movimiento seleccionado
  useEffect(() => {
    if (filtro.tipoMovimiento === 1) {
      setSubMovimientos([
        { value: 1, label: "COMPRA" },
        { value: 2, label: "AJUSTE" },
      ]);
    } else if (filtro.tipoMovimiento === 2) {
      setSubMovimientos([
        { value: 3, label: "TRASPASO" },
        { value: 4, label: "DEVOLUCION" },
      ]);
    } else {
      setSubMovimientos([]); // En caso de que no haya tipo seleccionado, no mostrar subtipos
    }
  }, [filtro.tipoMovimiento]); // Esta lógica se ejecutará cada vez que cambie el tipo de movimiento

  return (
    <>
      <NavBar onSearch={setSearchTerm} />
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

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Tipo Movimiento</InputLabel>
            <Select
              label="Tipo Movimiento"
              name="tipoMovimiento"
              value={filtro.tipoMovimiento} // Asegúrate de que use el valor correcto del filtro
              onChange={handleFiltroChange}
              sx={{ width: 200 }}
              inputProps={{ "aria-label": "Tipo Movimiento" }}
            >
              {tipoMovimiento.map((tipo) => (
                <MenuItem key={tipo.value} value={tipo.value}>
                  {tipo.label}{" "}
                  {/* Aquí utilizamos el label de tipoMovimiento */}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Subtipo</InputLabel>
            <Select
              label="Sub Movimiento"
              name="subMovimiento"
              value={filtro.subMovimiento}
              onChange={handleFiltroChange}
              sx={{ width: 200 }}
              inputProps={{ "aria-label": "Subtipo" }}
            >
              {subMovimiento.map((tipo) => (
                <MenuItem key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

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

          <Button
            variant="contained"
            color="primary"
            onClick={handleFiltroSearch}
          >
            Buscar
          </Button>
        </Box>

        <Box width="80%" maxWidth={1000} margin="0 auto" mt={2}>
          <Box
            sx={{
              backgroundColor: "#1f618d",
              padding: "10px 20px",
              borderRadius: "8px 8px 0 0",
            }}
          >
            <Typography variant="h5" fontWeight="bold" color="white">
              Movimientos en el almacen
            </Typography>
          </Box>

          <Paper sx={{ width: "100%" }}>
            <TableContainer sx={{ maxHeight: 600, backgroundColor: "#eaeded" }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    {[
                      // "No.Movimiento",
                      "Fecha",
                      "Tipo de Movimiento",
                      "Subtipo",
                      // "Realizo Mov.",
                      // "Autorizo",
                      "Detalles",
                    ].map((header) => (
                      <TableCell
                        key={header}
                        align="left" // Alineado a la izquierda
                        sx={{
                          fontWeight: "bold",
                          backgroundColor: "#f4f6f7",
                          color: "black",
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
                      {/* <TableCell align="left">
                        {producto.idMovimiento}
                      </TableCell> */}
                      <TableCell align="left">
                        {producto.fecha_movimiento
                          ? new Date(
                              producto.fecha_movimiento
                            ).toLocaleDateString("es-MX")
                          : "Fecha no disponible"}
                      </TableCell>
                      <TableCell align="left">
                        {producto.tipoMovimiento}
                      </TableCell>
                      <TableCell align="left">
                        {producto.subMovimiento}
                      </TableCell>
                      {/* <TableCell align="left">
                        {producto.nombreUsuario}
                      </TableCell>
                      <TableCell align="left">
                        {producto.nombreAutorizo}
                      </TableCell> */}
                      <TableCell align="left">
                        <IconButton
                          sx={{ color: "black" }}
                          onClick={() => handleOpenModal(producto.idMovimiento)}
                        >
                          <FeedIcon sx={{ fontSize: 29 }} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Controles de paginación */}
          <Box display="flex" justifyContent="center" mt={2}>
            <Button
              variant="contained"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              sx={{ marginRight: 2 }}
            >
              Anterior
            </Button>
            <Typography
              variant="body1"
              sx={{ marginTop: "auto", marginBottom: "auto" }}
            >
              Página {currentPage} de {totalPages}
            </Typography>
            <Button
              variant="contained"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              sx={{ marginLeft: 2 }}
            >
              Siguiente
            </Button>
          </Box>
        </Box>

        <EditarProductoAlmacenModal
          modalOpen={openModalEditar}
          onClose={() => setOpenModalEditar(false)}
          producto={productoSeleccionado}
          actualizarLista={actualizarLista}
        />

        <ModalMovimientosDetalles
          open={openModal}
          onClose={handleCloseModal}
          idMovimiento={selectedMovimiento}
        />
      </animated.div>
    </>
  );
};
