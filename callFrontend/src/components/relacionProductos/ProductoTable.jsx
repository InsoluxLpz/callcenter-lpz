import React, { useState, useEffect } from "react";
import EditIcon from "@mui/icons-material/Edit";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import InventoryIcon from "@mui/icons-material/Inventory";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { Box, Button, FormControlLabel, Grid2, IconButton, Switch, TextField, Typography } from "@mui/material";
import { NavBar } from "../NavBar";
import { obtenerProductos, ActualizarStatus, obtenerUnidadMedidas, obtenerGrupos } from "../../api/productosApi";
import { EditarProductoModal } from "../relacionProductos/EditarProductoModal";
import { AgregarProductoModal } from "./AgregarProductoModal";
import AddchartIcon from '@mui/icons-material/Addchart';
import { obtenerProveedores } from "../../api/proveedoresApi";
import { useSpring, animated } from "@react-spring/web";
import { TablePagination } from "@mui/material";

export const ProductoTable = () => {
  const [openModalEditar, setOpenModalEditar] = useState(false);
  const [openModalAgregar, setOpenModalAgregar] = useState(false);
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [proveedores, setProveedores] = useState([]);
  const [showInactive, setShowInactive] = useState(false);
  const [grupos, setGrupos] = useState([]);
  const [unidadMedida, setUnidadMedida] = useState([]);
  const [searchNombre, setSearchNombre] = useState("");
  const [searchDescripcion, setSearchDescripcion] = useState("");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  const fetchProductos = async () => {
    const data = await obtenerProductos();
    if (data) {
      setProductos(data);
      console.log(data)
    }
  };

  const fetchGrupos = async () => {
    const data = await obtenerGrupos();
    if (data) {
      setGrupos(data);
    }
  };

  const fetchUnidadMedida = async () => {
    const data = await obtenerUnidadMedidas();
    if (data) {
      setUnidadMedida(data);
    }
  };

  const fetchProveedor = async () => {
    const data = await obtenerProveedores([]);
    if (data) {
      setProveedores(data);
    }
  };

  const handleModalAgregar = () => {
    setOpenModalAgregar(true);
  };

  const handleCloseModalAgregar = () => {
    setOpenModalAgregar(false);
  };

  const handleActualizarStatus = (id) => {
    ActualizarStatus(id, (idActualizado) => {
      setProductos((productosActuales) =>
        productosActuales.map((producto) =>
          producto.id === idActualizado ? { ...producto, status: 0 } : producto
        )
      );
    });
  };

  const actualizarLista = (productoActualizado) => {
    setProductos((prevProductos) =>
      prevProductos.map((producto) =>
        producto.id === productoActualizado.id
          ? { ...producto, ...productoActualizado }
          : producto
      )
    );
  };

  const agregarProducto = (producto) => {
    setProductos(prevProductos => [...prevProductos, producto]);
  };

  const productosFiltrados = productos.filter((producto) => {
    if (showInactive) {
      return true;
    }

    return producto.status !== 0;
  });

  // **Filtro de productos**
  const filteredProductos = productosFiltrados.filter((producto) => {
    const nombre = producto.nombre ? producto.nombre.toLowerCase() : "";
    const descripcion = producto.descripcion ? producto.descripcion.toLowerCase() : "";

    return (
      nombre.includes(searchNombre.toLowerCase()) &&
      descripcion.includes(searchDescripcion.toLowerCase())
    );
  });

  // * Ordenar los productos por nombre alfabéticamente
  const productosOrdenados = filteredProductos.sort((a, b) => {
    if (a.nombre && b.nombre) {
      return a.nombre.toLowerCase().localeCompare(b.nombre.toLowerCase());
    }
    return 0;
  });

  // * formato de dinero 
  const formatearDinero = (valor) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(valor);
  };

  useEffect(() => {
    fetchProductos();
    fetchGrupos();
    fetchUnidadMedida();
    fetchProveedor();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to the first page when rows per page changes
  };

  const miniDrawerWidth = 50;

  const getStatusColor = (status) => {
    switch (status) {
      case 0:
        return "#f5b7b1"; // Amarillo claro para "inactiva"
      default:
        return "transparent"; // Fondo transparente si no coincide
    }
  };

  return (
    <>
      <Box
        sx={{ backgroundColor: "#f2f3f4", minHeight: "100vh", paddingBottom: 4, transition: "margin 0.3s ease-in-out", marginLeft: `${miniDrawerWidth}px` }}
      >
        <NavBar onSearch={setSearchTerm} />
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: 3, marginLeft: 12 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Grid2 container spacing={2} justifyContent="center" alignItems="center">

              <Grid2 item sm={6} md={3}>
                <TextField
                  label="Buscar por nombre"
                  variant="outlined"
                  sx={{ backgroundColor: "white", width: 400, marginRight: 3 }}
                  value={searchNombre}
                  onChange={(e) => setSearchNombre(e.target.value)}
                />
              </Grid2>

              <Grid2 item sm={6} md={3}>
                <TextField
                  label="Buscar por descripción"
                  variant="outlined"
                  sx={{ backgroundColor: "white", width: 400, marginRight: 3 }}
                  value={searchDescripcion}
                  onChange={(e) => setSearchDescripcion(e.target.value)}
                />
              </Grid2>

              <Grid2 item sm={6} md={3}>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    variant="contained"
                    sx={{ backgroundColor: "#1f618d", color: "white", ":hover": { opacity: 0.7 }, left: 20, borderRadius: "8px", padding: "5px 10px", display: "flex", alignItems: "center", gap: "8px", marginRight: 8 }}
                    onClick={handleModalAgregar}
                  >
                    <AddchartIcon sx={{ fontSize: 24 }} />
                    Agregar Productos
                  </Button>
                </Box>
              </Grid2>
            </Grid2>
          </Box>
        </Box>

        <Box width="90%" maxWidth={2000} margin="0 auto" mt={4}>

          <Box sx={{ backgroundColor: "#1f618d", padding: "10px 20px", borderRadius: "8px 8px 0 0" }}>
            <Typography variant="h5" color="white">
              Lista de Productos
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "flex-end", backgroundColor: 'white' }}>
            <Box sx={{ display: "flex", justifyContent: "flex-end", marginLeft: 2 }}>
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

          <Paper sx={{ width: "100%", maxWidth: "2000px", margin: "0 auto", backgroundColor: "white", padding: 2 }}>
            <TableContainer sx={{ maxHeight: 560, backgroundColor: "#ffff", border: "1px solid #d7dbdd", borderRadius: "2px" }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    {["Código", "Nombre", "Descripción", "Unidad de medida", "Grupo", "Precio", "Acciones"].map((header) => (
                      <TableCell key={header} align="center" sx={{ backgroundColor: "#f4f6f7", color: "black", textAlign: "left", width: "6.66%", fontWeight: "bold" }}>
                        {header}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {productosOrdenados.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((producto) => (
                    <TableRow key={producto.id} sx={{ backgroundColor: getStatusColor(producto.status), "&:hover": { backgroundColor: "#eaecee " } }}>
                      <TableCell align="center" sx={{ textAlign: "left", width: "10%" }}>{producto.codigo}</TableCell>
                      <TableCell align="center" sx={{ textAlign: "left", width: "15%" }}>{producto.nombre}</TableCell>
                      <TableCell align="center" sx={{ textAlign: "left", width: "15%" }}>{producto.descripcion}</TableCell>
                      <TableCell align="center" sx={{ textAlign: "left", width: "10%" }}>{producto.unidad_medida}</TableCell>
                      <TableCell align="center" sx={{ textAlign: "left", width: "10%" }}>{producto.grupo}</TableCell>
                      <TableCell align="center" sx={{ textAlign: "center", width: "5%" }}>{formatearDinero(producto.precio)}</TableCell>
                      <TableCell align="center" sx={{ textAlign: "left", width: "5%" }}>
                        <IconButton sx={{ color: 'black' }} onClick={() => { setProductoSeleccionado(producto); setOpenModalEditar(true); }}>
                          <EditIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                        <IconButton color="error" sx={{ marginLeft: 1 }} onClick={() => handleActualizarStatus(producto.id)}>
                          <InventoryIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          <EditarProductoModal
            modalOpen={openModalEditar}
            onClose={() => setOpenModalEditar(false)}
            producto={productoSeleccionado}
            ListaProductos={productos}
            actualizarLista={actualizarLista}
            listagrupos={grupos}
            unidadMedida={unidadMedida}
            ListaProveedores={proveedores}
          />

          <AgregarProductoModal
            modalOpen={openModalAgregar}
            onClose={handleCloseModalAgregar}
            grupos={grupos}
            unidadMedida={unidadMedida}
            agregarProducto={agregarProducto}
          />
          {/* Paginación */}
          <TablePagination
            rowsPerPageOptions={[50]}
            component="div"
            count={productosOrdenados.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Box>
      </Box>
    </>
  );
};