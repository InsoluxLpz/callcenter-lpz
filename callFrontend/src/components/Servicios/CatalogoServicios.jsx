import React, { useEffect, useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import AddchartIcon from "@mui/icons-material/Addchart";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import {
  Box,
  Button,
  FormControlLabel,
  Grid2,
  IconButton,
  Paper,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { NavBar } from "../NavBar";
import { ActualizarStatus, ObtenerServicios } from "../../api/ServiciosApi";
import { EditarServiciosModal } from "./EditarServiciosModal";
import InventoryIcon from "@mui/icons-material/Inventory";
import { AgregarServicios } from "./AgregarServicios";
import { useSpring, animated } from "@react-spring/web";

export const CatalogoServicios = () => {
  const [servicios, setServicios] = useState([]);
  const [openModalEditar, setOpenModalEditar] = useState(false);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
  const [openModalAgregar, setOpenModalAgregar] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleOpenModalEdit = (servicio) => {
    setServicioSeleccionado(servicio);
    setOpenModalEditar(true);
  };

  const handleCloseModalEdit = () => {
    setOpenModalEditar(false);
    setServicioSeleccionado(null);
  };
  const handleOpenModalAgregar = () => {
    setOpenModalAgregar(true);
  };

  const handleCloseModalAgregar = () => {
    setOpenModalAgregar(false);
  };

  const agregarServicioLista = (nuevoServicio) => {
    const nombreExistente = servicios.some(
      (servicio) =>
        servicio.nombre.toLowerCase() === nuevoServicio.nombre.toLowerCase()
    );

    if (nombreExistente) {
      setError(
        "El nombre del servicio ya existe. Por favor, elija otro nombre."
      );
    } else {
      setServicios((prevServicios) =>
        [...prevServicios, nuevoServicio].sort((a, b) =>
          a.nombre.toLowerCase().localeCompare(b.nombre.toLowerCase())
        )
      );
      setError(null);
    }
  };

  const handleActualizarStatus = (id) => {
    ActualizarStatus(id, (idActualizado) => {
      setServicios((serviciosActuales) =>
        serviciosActuales.map((servicio) =>
          servicio.id === idActualizado ? { ...servicio, status: 0 } : servicio
        )
      );
    });
  };

  const actualizarLista = (servicioActualizado) => {
    setServicios((prevServicios) =>
      prevServicios
        .map((servicio) =>
          servicio.id === servicioActualizado.id
            ? servicioActualizado
            : servicio
        )
        .sort((a, b) =>
          a.nombre.toLowerCase().localeCompare(b.nombre.toLowerCase())
        )
    );
  };

  const cargarServicios = async () => {
    const data = await ObtenerServicios();
    if (data) {
      // Ordenar antes de actualizar el estado
      const sortedData = data.sort((a, b) =>
        a.nombre.toLowerCase().localeCompare(b.nombre.toLowerCase())
      );
      setServicios(sortedData);
    }
  };

  useEffect(() => {
    cargarServicios();
  }, []);

  const miniDrawerWidth = 50;

  const getStatusColor = (status) => {
    switch (status) {
      case 0:
        return "#f5b7b1"; // Amarillo claro para "inactiva"
      default:
        return "transparent"; // Fondo transparente si no coincide
    }
  };
  const serviciosFiltrados = servicios
    .filter(
      (servicio) =>
        (showInactive || servicio.status !== 0) &&
        servicio.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) =>
      a.nombre.toLowerCase().localeCompare(b.nombre.toLowerCase())
    );

  // * diseño de carga en las tablas
  const styles = useSpring({
    from: { opacity: 0, transform: "translateY(50px)", filter: "blur(10px)" },
    to: { opacity: 1, transform: "translateY(0)", filter: "blur(0px)" },
    config: { tension: 500, friction: 30 },
  });

  return (
    <>
      <Box
        sx={{
          backgroundColor: "#f2f3f4",
          minHeight: "100vh",
          paddingBottom: 4,
          transition: "margin 0.3s ease-in-out",
          marginLeft: `${miniDrawerWidth}px`,
        }}
      >
        <NavBar />
        <animated.div style={styles}>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginTop: 3,
              marginLeft: 12,
            }}
          >
            <Box sx={{ flexGrow: 1 }}>
              <Grid2
                container
                spacing={2}
                justifyContent="center"
                alignItems="center"
              >
                <Grid2 item sm={6} md={3}>
                  <TextField
                    label="Buscar por nombre"
                    variant="outlined"
                    sx={{ backgroundColor: "white", width: 400, marginRight: 3 }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </Grid2>

                <Grid2 item sm={6} md={3}>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      variant="contained"
                      sx={{
                        backgroundColor: "#1f618d",
                        color: "white",
                        ":hover": { opacity: 0.7 },
                        right: 20,
                        borderRadius: "8px",
                        padding: "5px 10px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginRight: 8,
                      }}
                      onClick={handleOpenModalAgregar}
                    >
                      <AddchartIcon sx={{ fontSize: 24 }} />
                      Agregar Servicio
                    </Button>
                  </Box>
                </Grid2>
              </Grid2>
            </Box>
          </Box>

          <Box width="70%" maxWidth={2000} margin="0 auto" mt={2}>
            <Box
              sx={{
                backgroundColor: "#1f618d",
                padding: "10px 20px",
                borderRadius: "8px 8px 0 0",
              }}
            >
              <Typography variant="h5" color="white">
                Lista de Servicios
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                backgroundColor: "white",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginLeft: 2,
                }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={showInactive}
                      onChange={(e) => setShowInactive(e.target.checked)}
                    />
                  }
                  label="Mostrar inactivas"
                />
              </Box>
            </Box>
          </Box>
          <Paper
            sx={{
              width: "70%",
              maxWidth: "2000px",
              margin: "0 auto",
              backgroundColor: "white",
              padding: 2,
            }}
          >
            <TableContainer
              sx={{
                maxHeight: 560,
                backgroundColor: "#ffff",
                border: "1px solid #d7dbdd",
                borderRadius: "2px",
              }}
            >
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow>
                    <TableCell
                      align="left"
                      sx={{
                        fontWeight: "bold",
                        width: "40%",
                        backgroundColor: "#f4f6f7",
                      }}
                    >
                      Nombre
                    </TableCell>
                    <TableCell
                      align="left"
                      sx={{
                        fontWeight: "bold",
                        width: "40%",
                        backgroundColor: "#f4f6f7",
                      }}
                    >
                      Descripción
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        width: "20%",
                        backgroundColor: "#f4f6f7",
                      }}
                    >
                      Opciones
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {serviciosFiltrados.map((servicio) => (
                    <TableRow
                      key={servicio.id}
                      sx={{
                        backgroundColor: getStatusColor(servicio.status),
                        "&:hover": {
                          backgroundColor: "#eaecee ",
                        },
                      }}
                    >
                      <TableCell
                        align="left"
                        sx={{ textAlign: "left", width: "25%" }}
                      >
                        {servicio.nombre?.toUpperCase()}
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{ textAlign: "left", width: "25%" }}
                      >
                        {servicio.descripcion?.toUpperCase()}
                      </TableCell>
                      <TableCell align="center" sx={{ width: "20%" }}>
                        <IconButton
                          sx={{ color: "black" }}
                          onClick={() => handleOpenModalEdit(servicio)}
                        >
                          <EditIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                        <IconButton
                          sx={{ marginLeft: "10px", color: "black" }}
                          onClick={() => handleActualizarStatus(servicio.id)}
                        >
                          <InventoryIcon sx={{ fontSize: 20, color: "red" }} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </animated.div>
      </Box>

      <EditarServiciosModal
        onClose={handleCloseModalEdit}
        modalOpen={openModalEditar}
        servicio={servicioSeleccionado}
        actualizarLista={actualizarLista}
        ListaServicios={servicios}
      />

      <AgregarServicios
        onClose={handleCloseModalAgregar}
        modalOpen={openModalAgregar}
        agregarServicioLista={agregarServicioLista}
      />
    </>
  );
};
