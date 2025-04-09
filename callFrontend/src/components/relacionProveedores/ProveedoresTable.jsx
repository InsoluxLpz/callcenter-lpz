import React, { useState, useEffect } from "react";
import { Box, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, FormControlLabel, Switch, Button, Grid2, TextField, } from "@mui/material";
import AddchartIcon from '@mui/icons-material/Addchart';
import InventoryIcon from "@mui/icons-material/Inventory";
import EditIcon from "@mui/icons-material/Edit";
import { obtenerProveedores, ActualizarStatus } from "../../api/proovedoresApi";
import { NavBar } from "../NavBar";
import { AgregarProveedoresModal } from "./AgregarProveedoresModal";
import { EditarProveedoresModal } from "./EditarProveedoresModal";
import { useSpring, animated } from "@react-spring/web";

export const ProveedoresTable = () => {
  const [proveedores, setProveedores] = useState([]);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
  const [searchEmpresa, setSearchEmpresa] = useState("");
  const [searchNombre, setSearchNombre] = useState("");
  const [searchTelefono, setSearchTelefono] = useState("");
  const [openModalAgregar, setOpenModalAgregar] = useState(false);
  const [openModalEditar, setOpenModalEditar] = useState(false);
  const [showInactive, setShowInactive] = useState(false);

  const agregarProveedorHandler = (nuevoProveedor) => {
    setProveedores((prevProveedor) =>
      [...prevProveedor, nuevoProveedor].sort((a, b) =>
        a.nombre_empresa.toLowerCase().localeCompare(b.nombre_empresa.toLowerCase())
      )
    );
  };

  const handleOpenModalAgregar = () => {
    setOpenModalAgregar(true);
  };

  const handleCloseModalAgregar = () => {
    setOpenModalAgregar(false);
  };

  const handleOpenModalEditar = (proveedor) => {
    setProveedorSeleccionado(proveedor);
    setOpenModalEditar(true);
  };
  const handleCloseModalEditar = () => {
    setOpenModalEditar(false);
    setProveedorSeleccionado(null);
  };

  useEffect(() => {
    fetchProveedores();
  }, []);

  const fetchProveedores = async () => {
    try {
      const data = await obtenerProveedores();
      if (data) {
        // Ordenar antes de setear en el estado
        const sortedData = data.sort((a, b) =>
          a.nombre_empresa.toLowerCase().localeCompare(b.nombre_empresa.toLowerCase())
        );
        setProveedores(sortedData);
        console.log(data)
      }
    } catch (error) {
      console.error("Error en la petición al obtener proveedores");
    }
  };

  // * actualizar la lista
  const actualizarLista = (proveedorActualizado) => {
    setProveedores((prevProveedor) =>
      prevProveedor
        .map((m) => (m.id === proveedorActualizado.id ? proveedorActualizado : m))
        .sort((a, b) => a.nombre_empresa.toLowerCase().localeCompare(b.nombre_empresa.toLowerCase()))
    );
  };


  // * actualizar status para que desaparezca de la lista pero no se elimine
  const handleActualizarStatus = (id) => {
    ActualizarStatus(id, (idActualizado) => {
      setProveedores((proveedoresActuales) =>
        proveedoresActuales.map((proveedor) =>
          proveedor.id === idActualizado
            ? { ...proveedor, status: 0 }
            : proveedor
        )
      );
    });
  };

  const filteredProveedores = proveedores
    .filter((proveedor) => {
      const empresaMatch =
        !searchEmpresa ||
        (proveedor.nombre_empresa &&
          proveedor.nombre_empresa.toLowerCase().includes(searchEmpresa.toLowerCase())); // Búsqueda flexible con includes

      const nombreMatch =
        !searchNombre ||
        (proveedor.nombre_proveedor &&
          proveedor.nombre_proveedor.toLowerCase().includes(searchNombre.toLowerCase())); // Búsqueda flexible con includes

      const telefonoMatch =
        !searchTelefono ||
        (proveedor.telefono_empresa &&
          proveedor.telefono_empresa.includes(searchTelefono)); // Búsqueda flexible con includes

      const matchesStatus = showInactive || proveedor.status !== 0;

      return empresaMatch && nombreMatch && telefonoMatch && matchesStatus;
    })
    .sort((a, b) => {
      if (a.nombre_empresa.toLowerCase() < b.nombre_empresa.toLowerCase()) return -1;
      if (a.nombre_empresa.toLowerCase() > b.nombre_empresa.toLowerCase()) return 1;
      return 0;
    });

  const getStatusColor = (status) => {
    switch (status) {
      case 0:
        return "#f5b7b1";
      default:
        return "transparent";
    }
  };

  const miniDrawerWidth = 50;

  // * diseño de carga en las tablas
  const styles = useSpring({
    from: { opacity: 0, transform: "translateY(50px)", filter: "blur(10px)" },
    to: { opacity: 1, transform: "translateY(0)", filter: "blur(0px)" },
    config: { tension: 500, friction: 30 },
  });

  return (
    <>
      <Box
        sx={{ backgroundColor: "#f2f3f4", minHeight: "100vh", paddingBottom: 4, transition: "margin 0.3s ease-in-out", marginLeft: `${miniDrawerWidth}px`, }}
      >
        <NavBar />
        <animated.div style={styles}>
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: 3, marginLeft: 12 }}>
            <Box sx={{ flexGrow: 1 }}>
              <Grid2 container spacing={2} justifyContent="center" alignItems="center">
                <Grid2 item sm={6} md={3}>
                  <TextField
                    label="Buscar por Empresa"
                    variant="outlined"
                    sx={{ backgroundColor: "white", width: 400 }}
                    value={searchEmpresa}
                    onChange={(e) => setSearchEmpresa(e.target.value)}
                  />
                </Grid2>

                <Grid2 item sm={6} md={3}>
                  <TextField
                    label="Buscar por Contacto"
                    variant="outlined"
                    sx={{ backgroundColor: "white", width: 400 }}
                    value={searchNombre}
                    onChange={(e) => setSearchNombre(e.target.value)}
                  />
                </Grid2>

                <Grid2 item sm={6} md={3}>
                  <TextField
                    label="Buscar por Tel.Empresa"
                    variant="outlined"
                    type="number"
                    sx={{ backgroundColor: "white", width: 400, marginRight: 3 }}
                    value={searchTelefono}
                    onChange={(e) => setSearchTelefono(e.target.value)}
                  />
                </Grid2>

                <Grid2 item sm={6} md={3}>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      variant="contained"
                      sx={{ backgroundColor: "#1f618d", color: "white", ":hover": { opacity: 0.7 }, right: 20, borderRadius: "8px", padding: "5px 10px", display: "flex", alignItems: "center", gap: "8px", marginRight: 8 }}
                      onClick={handleOpenModalAgregar}>
                      <AddchartIcon sx={{ fontSize: 24 }} />
                      Agregar Proveedor
                    </Button>
                  </Box>
                </Grid2>
              </Grid2>
            </Box>
          </Box>

          <Box width="90%" maxWidth={2000} margin="0 auto" mt={2}>
            {/* Header alineado a la izquierda con fondo */}
            <Box sx={{ backgroundColor: "#1f618d", padding: "10px 20px", borderRadius: "8px 8px 0 0" }}>
              <Typography variant="h5" color="white">
                Lista Proveedores
              </Typography>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "flex-end", backgroundColor: 'white' }}>
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

            <Paper sx={{ width: "100%", maxWidth: "2000px", margin: "0 auto", backgroundColor: "white", padding: 2 }}>
              <TableContainer sx={{ maxHeight: 560, backgroundColor: "#ffff", border: "1px solid #d7dbdd", borderRadius: "2px" }}>
                <Table stickyHeader aria-label="sticky table">
                  <TableHead>
                    <TableRow>
                      {["Empresa", "Contacto", "Teléfono Contacto", "Teléfono Empresa", "RFC", "Acciones"].map((col) => (
                        <TableCell
                          key={col}
                          sx={{
                            backgroundColor: "#f4f6f7",
                            color: "black",
                            textAlign: "left",
                            width: "16.66%",
                            fontWeight: 'bold'
                          }}
                        >
                          {col}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {filteredProveedores.map((proveedor, index) => (
                      <TableRow
                        key={proveedor.id}
                        sx={{
                          backgroundColor: getStatusColor(proveedor.status),// Combina ambos colores
                          "&:hover": {
                            backgroundColor: "#eaecee ", // Color al pasar el mouse
                          }
                        }}
                      >
                        <TableCell sx={{ textAlign: "left", width: "16.66%" }}>{proveedor.nombre_empresa?.toUpperCase()}</TableCell>
                        <TableCell sx={{ textAlign: "left", width: "16.66%" }}>{proveedor.nombre_proveedor?.toUpperCase()}</TableCell>
                        <TableCell sx={{ textAlign: "left", width: "16.66%" }}>{proveedor.telefono_contacto}</TableCell>
                        <TableCell sx={{ textAlign: "left", width: "16.66%" }}>{proveedor.telefono_empresa}</TableCell>
                        <TableCell sx={{ textAlign: "left", width: "16.66%" }}>{proveedor.rfc?.toUpperCase()}</TableCell>
                        <TableCell sx={{ textAlign: "left", width: "16.66%" }}>
                          <IconButton sx={{ color: "black" }} onClick={() => handleOpenModalEditar(proveedor)}>
                            <EditIcon sx={{ fontSize: 20 }} />
                          </IconButton>
                          <IconButton color="error" sx={{ marginLeft: "10px" }} onClick={() => handleActualizarStatus(proveedor.id)}>
                            <InventoryIcon sx={{ fontSize: 20 }} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

          </Box>
        </animated.div>
        <AgregarProveedoresModal
          modalOpen={openModalAgregar}
          onClose={handleCloseModalAgregar}
          agregarProveedorHandler={agregarProveedorHandler}
        />
        <EditarProveedoresModal
          modalOpen={openModalEditar}
          onClose={handleCloseModalEditar}
          proveedor={proveedorSeleccionado}
          actualizarLista={actualizarLista}
          ListaProveedor={proveedores}
        />
      </Box>
    </>
  );
};
