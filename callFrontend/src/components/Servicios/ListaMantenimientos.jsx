import { useEffect, useState } from "react";
import { Box, Button, FormControlLabel, Grid2, IconButton, Switch, TextField, Typography } from "@mui/material";
import { NavBar } from "../NavBar";
import { EliminarMantenimiento, ObtenerMantenimientos, ObtenerServicios, } from "../../api/ServiciosApi";
import { EditarMantenimiento } from "./EditarMantenimiento";
import { obtenerProductos } from "../../api/productosApi";
import { obtenerMotos } from "../../api/motosApi";
import { VerMantenimientoCancelado } from "./VerMantenimientoCancelado";
import EditIcon from "@mui/icons-material/Edit";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import DeleteIcon from "@mui/icons-material/Delete";
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import InfoIcon from "@mui/icons-material/Info";
import SearchIcon from '@mui/icons-material/Search';
import Select from "react-select";

export const ListaMantenimientos = () => {
  const [mantenimientos, setMantenimientos] = useState([]);
  const [mantenimientoSeleccionado, setMantenimientoSeleccionado] = useState(null);
  const [openModalEditar, setOpenModalEditar] = useState(false);
  const [openModalInfo, setOpenModalInfo] = useState(false);
  const [servicios, setServicios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [todos, setTodos] = useState(false);
  const [motos, setMotos] = useState([]);
  const [filtro, setFiltro] = useState({
    fecha_inicio: "",
    fecha_final: "",
    servicio: "",
    moto: "",
  });

  const handleOpenModalEditar = (mantenimiento) => {
    setOpenModalEditar(true);
    setMantenimientoSeleccionado(mantenimiento);
  };
  const handleCloseModalEditar = () => setOpenModalEditar(false);

  const handleOpenModalInfo = (mantenimiento) => {
    setMantenimientoSeleccionado(mantenimiento);
    setOpenModalInfo(true);
  };
  const handleCloseModalInfo = () => setOpenModalInfo(false);

  const fetchMotos = async () => {
    const data = await obtenerMotos();
    if (data) {
      const motosOrdenadas = data.sort((a, b) => a.inciso - b.inciso);
      setMotos(motosOrdenadas);
    }
  };

  const fetchServicios = async () => {
    const data = await ObtenerServicios();
    if (data) {
      const serviciosFiltrados = data
        .filter((serv) => serv.status !== 0)
      setServicios(serviciosFiltrados);
    }
  };

  const fetchProducto = async () => {
    const data = await obtenerProductos();
    if (data) setProductos(data);
  };

  const handleEliminarMantenimiento = async (id) => {
    await EliminarMantenimiento(id, (idEliminado) => {
      setMantenimientos((mantenimientosActuales) =>
        mantenimientosActuales.filter(
          (mantenimiento) => mantenimiento.id !== idEliminado
        )
      );
    });
    cargarMantenimientos();
  };

  const cargarMantenimientos = async () => {
    const data = await ObtenerMantenimientos({
      filtro: {
        ...filtro,
        servicio: filtro.servicio?.value || "",
        moto: filtro.moto?.value ? Number(filtro.moto.value) : "",
        todos: todos
      }
    });

    if (data) {
      const mantenimientosAdaptados = data.map((servicio) => ({
        id: servicio.id,
        moto_inciso: servicio.moto_inciso || "Desconocido",
        idMoto: servicio.idMoto || "",
        idAutorizo: servicio.idAutorizo || "",
        fecha_inicio: servicio.fecha_inicio,
        fecha_cancelacion: servicio.fecha_cancelacion,
        comentario: servicio.comentario,
        costo_total: parseFloat(servicio.costo_total) || 0,
        servicios: servicio.servicios || [],
        productos: servicio.productos || [],
        odometro: servicio.odometro || 0,
        status: servicio.status,
        nombre: servicio.nombre,
      }));
      const mantenimientosOrdenados = mantenimientosAdaptados.sort((a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio));

      setMantenimientos(mantenimientosOrdenados);
    }
  };

  const limpiarFiltros = () => {
    window.location.reload();
  };

  useEffect(() => {
    cargarMantenimientos();
    fetchMotos();
    fetchProducto();
    fetchServicios();
  }, []);

  const obtenerInicioYFinSemana = () => {
    const fechaActual = new Date();

    // Crear una nueva fecha para el primer día de la semana (domingo)
    const primerDiaSemana = new Date(fechaActual);
    primerDiaSemana.setDate(fechaActual.getDate() - fechaActual.getDay()); // Domingo de la semana

    // Crear una nueva fecha para el último día de la semana (sábado)
    const ultimoDiaSemana = new Date(primerDiaSemana);
    ultimoDiaSemana.setDate(primerDiaSemana.getDate() + 6); // Sábado de la misma semana

    // Aseguramos que el domingo sea el día correcto de la semana
    const fechaInicioFormateada = primerDiaSemana.toISOString().split("T")[0];
    const fechaFinFormateada = ultimoDiaSemana.toISOString().split("T")[0];

    return { fechaInicioFormateada, fechaFinFormateada };
  };


  useEffect(() => {
    const { fechaInicioFormateada, fechaFinFormateada } = obtenerInicioYFinSemana();
    setFiltro({
      ...filtro,
      fecha_inicio: fechaInicioFormateada,
      fecha_final: fechaFinFormateada,
    });
  }, []);

  const formatearDinero = (valor) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(valor);
  };

  const calcularTotales = () => {
    const activos = mantenimientos.filter(m => m.status === 1);
    const cancelados = mantenimientos.filter(m => m.status === 0);

    const totalActivos = activos.reduce((total, mantenimiento) => total + mantenimiento.costo_total, 0);
    const totalCancelados = cancelados.reduce((total, mantenimiento) => total + mantenimiento.costo_total, 0);

    return { totalActivos, totalCancelados };
  };

  const { totalActivos, totalCancelados } = calcularTotales();

  const opcionesServicios = [
    { value: "", label: "Selecciona" },
    ...servicios.sort((a, b) => a.nombre.localeCompare(b.nombre)).map((serv) => ({ value: serv.id, label: serv.nombre }))
  ];

  const opcionesMotos = [
    { value: "", label: "Selecciona" },
    ...motos.map((mot) => ({ value: mot.id, label: mot.inciso }))
  ];

  const miniDrawerWidth = 50;

  return (
    <>
      <Box
        sx={{ backgroundColor: "#f2f3f4", minHeight: "100vh", paddingBottom: 4, transition: "margin 0.3s ease-in-out", marginLeft: `${miniDrawerWidth}px`, }}
      >
        <NavBar />
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: 3, marginLeft: 12 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Grid2 container spacing={2} justifyContent="center" alignItems="center">

              <Grid2>
                <FormControlLabel
                  control={
                    <Switch
                      checked={todos}
                      onChange={(e) => setTodos(e.target.checked)}
                    />
                  }
                  label="Mostrar todos"
                />
              </Grid2>

              <Grid2 item sm={6} md={3}>
                <Select
                  name="motos"
                  options={opcionesMotos}
                  isMulti={false}
                  placeholder="SELECCIONA MOTO"
                  value={filtro.moto}
                  onChange={(selectedOption) =>
                    setFiltro({ ...filtro, moto: selectedOption })
                  }
                  styles={{
                    control: (base) => ({
                      ...base,
                      minHeight: "45px",
                      height: "55px",
                      width: 200
                    }),
                    menuList: (provided) => ({
                      ...provided,
                      maxHeight: "200px",
                      overflowY: "auto",
                    }),
                  }}
                />
              </Grid2>

              <Grid2 item sm={6} md={3}>
                <Select
                  name="servicios"
                  options={opcionesServicios}
                  isMulti={false}
                  placeholder="SELECCIONA SERVICIO"
                  value={filtro.servicio}
                  onChange={(selectedOption) =>
                    setFiltro({ ...filtro, servicio: selectedOption })
                  }
                  styles={{
                    control: (base) => ({
                      ...base,
                      minHeight: "45px",
                      height: "55px",
                      width: 200
                    }),
                    menuList: (provided) => ({
                      ...provided,
                      maxHeight: "200px",
                      overflowY: "auto",
                    }),
                  }}
                />
              </Grid2>

              <Grid2 item sm={6} md={3}>
                <TextField
                  label="Fecha desde"
                  type="date"
                  variant="outlined"
                  sx={{ backgroundColor: "white", width: 200 }}
                  name="fecha_inicio"
                  value={filtro.fecha_inicio}
                  onFocus={(e) => e.target.showPicker()}
                  onChange={(e) => setFiltro({ ...filtro, fecha_inicio: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid2>

              <Grid2 item sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Fecha hasta"
                  type="date"
                  variant="outlined"
                  sx={{ backgroundColor: "white", width: 200 }}
                  name="fecha_final"
                  value={filtro.fecha_final}
                  onFocus={(e) => e.target.showPicker()}
                  onChange={(e) => setFiltro({ ...filtro, fecha_final: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid2>

              <Grid2 item sm={6} md={3}>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button variant="contained" sx={{ backgroundColor: "#196f3d", color: "white", ":hover": { opacity: 0.7 }, borderRadius: "8px", padding: "5px 10px", display: "flex", alignItems: "center", gap: "8px" }}
                    onClick={cargarMantenimientos}
                  >
                    <SearchIcon sx={{ fontSize: 24 }} />
                  </Button>

                  <Button variant="contained" sx={{ backgroundColor: "#566573", color: "white", ":hover": { opacity: 0.7 }, borderRadius: "8px", padding: "5px 10px", display: "flex", alignItems: "center", gap: "8px", marginRight: 4 }}
                    onClick={limpiarFiltros}
                  >
                    <CleaningServicesIcon sx={{ fontSize: 24 }} />
                  </Button>
                </Box>
              </Grid2>
            </Grid2>
          </Box>
        </Box>

        <Box width="90%" maxWidth={2000} margin="0 auto" mt={3}>

          <Box sx={{ backgroundColor: "#1f618d", padding: "10px 20px", borderRadius: "8px 8px 0 0" }}>
            <Typography variant="h5" color="white">
              Lista de Mantenimientos
            </Typography>
          </Box>

          <Paper sx={{ width: "100%", maxWidth: "2000px", margin: "0 auto", backgroundColor: "white", padding: 2 }}>
            <TableContainer sx={{ maxHeight: 560, backgroundColor: "#ffff ", border: "1px solid #d7dbdd", borderRadius: "2px" }}>
              <Table >
                <TableHead>
                  <TableRow>
                    {["Vehiculo", "Servicio(s)", "Refacciones Almacen", "Fecha de Inicio", "Comentario", "Costo Total", "status", "Acciones"].map((header) => (
                      <TableCell key={header} align="center" sx={{ fontWeight: "bold", backgroundColor: "#f4f6f7", color: "black", textAlign: "left", width: "6.66%" }}>
                        {header}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mantenimientos.length > 0 ? (
                    mantenimientos.map((mantenimiento) => (
                      <TableRow
                        key={mantenimiento.id}
                        sx={{

                          "&:hover": {
                            backgroundColor: "#eaecee ",
                          },
                        }}
                      >
                        <TableCell align="center" sx={{ textAlign: "left", width: "6.66%" }}>
                          {mantenimiento.moto_inciso}
                        </TableCell>
                        <TableCell align="center" sx={{ textAlign: "left", width: "15%" }}>
                          {mantenimiento.servicios.length > 0
                            ? mantenimiento.servicios.map((s) => s.nombre.toUpperCase()).join(", ")
                            : "N/A"}
                        </TableCell>
                        <TableCell align="center" sx={{ textAlign: "left", width: "15%" }}>
                          {mantenimiento.productos.length > 0
                            ? mantenimiento.productos.map((p) => p.nombre.toUpperCase()).join(", ")
                            : "N/A"}
                        </TableCell>
                        <TableCell align="center" sx={{ textAlign: "left", width: "15%" }}>
                          {new Date(mantenimiento.fecha_inicio).toLocaleString("es-MX")}
                        </TableCell>

                        <TableCell align="center" sx={{ textAlign: "left", width: "10%" }}>
                          {mantenimiento.comentario?.toUpperCase()}
                        </TableCell>
                        <TableCell align="center" sx={{ textAlign: "center", }}>
                          {formatearDinero(mantenimiento.costo_total)}
                        </TableCell>
                        <TableCell align="center" sx={{ textAlign: "left", fontWeight: "bold", color: mantenimiento.status === 0 ? "red" : "green" }}>
                          {mantenimiento.status === 0 ? "Cancelado" : "Activo"}
                        </TableCell>

                        <TableCell align="center" sx={{ textAlign: "right" }}>
                          {mantenimiento.status === 1 ? (
                            <>
                              <IconButton
                                variant="contained"
                                sx={{ color: "black" }}
                                onClick={() => handleOpenModalEditar(mantenimiento)}
                              >
                                <EditIcon sx={{ fontSize: 20 }} />
                              </IconButton>
                              <IconButton
                                variant="contained"
                                color="error"
                                style={{ marginLeft: "10px" }}
                                onClick={() => handleEliminarMantenimiento(mantenimiento.id)}
                              >
                                <DeleteIcon sx={{ fontSize: 20 }} />
                              </IconButton>
                            </>
                          ) : (
                            <IconButton
                              variant="contained"
                              color="primary"
                              onClick={() => handleOpenModalInfo(mantenimiento)}
                            >
                              <InfoIcon sx={{ fontSize: 20 }} />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No hay mantenimientos disponibles
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ display: "flex", justifyContent: "flex-end", marginTop: 2, paddingRight: 2, }}>
              <Box sx={{ display: "flex", justifyContent: "flex-end", padding: "10px 20px", borderRadius: "8px", width: "auto", gap: 2, }}>
                <Typography variant="h6" sx={{ fontWeight: "bold", color: "green" }}>
                  Total Activos: {formatearDinero(totalActivos)}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: "bold", color: "red" }}>
                  Total Cancelados: {formatearDinero(totalCancelados)}
                </Typography>
              </Box>
            </Box>

            <EditarMantenimiento
              modalOpen={openModalEditar}
              onClose={handleCloseModalEditar}
              mantenimiento={mantenimientoSeleccionado}
              listaMotos={motos}
              listaProductos={productos}
              listaServicios={servicios}
            />

            <VerMantenimientoCancelado
              modalOpen={openModalInfo}
              onClose={handleCloseModalInfo}
              mantenimiento={mantenimientoSeleccionado}
              listaMotos={motos}
              listaServicios={servicios}
            />
          </Paper>
        </Box>
      </Box>
    </>
  );
};
