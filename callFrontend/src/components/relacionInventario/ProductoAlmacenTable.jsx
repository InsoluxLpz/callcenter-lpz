import React, { useState, useEffect } from "react";
import { NavBar } from "../NavBar";
import {
  Box,
  Typography,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useSpring, animated } from "@react-spring/web";
import { cargarListasCampos } from "../../api/almacenProductosApi";

export const ProductoAlmacenTable = () => {
  const [inventario, setInventario] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtro, setFiltro] = useState({
    codigo: "",
    unidadMedida: "",
    nombreProducto: "",
    nombreGrupo: "",
  });

  // Animación para todo el componente
  const styles = useSpring({
    from: { opacity: 0, transform: "translateY(50px)", filter: "blur(10px)" },
    to: { opacity: 1, transform: "translateY(0)", filter: "blur(0px)" },
    config: { tension: 500, friction: 30 },
  });

  useEffect(() => {
    fetchInventario();
  }, []);

  const fetchInventario = async () => {
    try {
      const data = await cargarListasCampos();
      if (data) {
        setInventario(data);
      }
    } catch (error) {
      console.error("Error en la petición al obtener Inventario");
    }
  };

  const handleFiltroChange = (e) => {
    setFiltro({ ...filtro, [e.target.name]: e.target.value });
  };

  const filteredInventario = inventario.filter((m) => {
    const nombreProductoMatch =
      filtro.nombreProducto === "" ||
      (m.nombreProducto &&
        m.nombreProducto
          .toLowerCase()
          .includes(filtro.nombreProducto.toLowerCase().trim()));

    const codigoMatch =
      filtro.codigo === "" ||
      (m.codigo &&
        m.codigo.toLowerCase().includes(filtro.codigo.toLowerCase().trim()));

    const unidadMedidaMatch =
      filtro.unidadMedida === "" ||
      (m.unidadMedida &&
        m.unidadMedida
          .toLowerCase()
          .includes(filtro.unidadMedida.toLowerCase()));

    const nombreGrupoMatch =
      filtro.nombreGrupo === "" ||
      (m.nombreGrupo &&
        m.nombreGrupo.toLowerCase().includes(filtro.nombreGrupo.toLowerCase()));

    return (
      nombreProductoMatch &&
      codigoMatch &&
      unidadMedidaMatch &&
      nombreGrupoMatch
    );
  });

  const sortedInventario = [...filteredInventario]
    .filter(producto => producto.cantidad > 0) // Filtra productos con cantidad mayor a 0
    .sort((a, b) => a.nombreProducto.localeCompare(b.nombreProducto));


  const formatearNumero = (valor) => {
    return new Intl.NumberFormat("es-MX", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(valor);
  };

  // * funcion para formato de dinero
  const formatearDinero = (valor) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(valor);
  };

  return (
    <>
      <NavBar onSearch={setSearchTerm} />
      <animated.div style={styles}>
        {/* Todo el componente ahora está envuelto en el contenedor animado */}

        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          gap={2}
          my={2}
          sx={{
            backgroundColor: "#f4f6f7",
            borderRadius: "8px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Typography variant="h6" fontWeight="bold" color="#1f618d">
            Filtros en inventario
          </Typography>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexWrap="wrap"
            gap={2}
          >
            <FilterListIcon
              sx={{
                fontSize: 32, // Ajusta el tamaño del ícono
                color: "#1f618d", // Personaliza el color para que combine con el diseño
                marginRight: 1, // Añade margen para separar del primer filtro
              }}
            />
            <TextField
              label="Código"
              name="codigo"
              value={filtro.codigo}
              onChange={handleFiltroChange}
              variant="outlined"
              sx={{ minWidth: 200 }}
            />
            <TextField
              label="Nombre del Producto"
              name="nombreProducto"
              value={filtro.nombreProducto}
              onChange={handleFiltroChange}
              variant="outlined"
              sx={{ minWidth: 200 }}
            />
            <TextField
              label="Unidad de medida"
              name="unidadMedida"
              value={filtro.unidadMedida}
              onChange={handleFiltroChange}
              variant="outlined"
              sx={{ minWidth: 200 }}
            />
            <TextField
              label="Nombre del grupo"
              name="nombreGrupo"
              value={filtro.nombreGrupo}
              onChange={handleFiltroChange}
              variant="outlined"
              sx={{ minWidth: 200 }}
            />
          </Box>
        </Box>

        <Box width="85%" maxWidth={1300} margin="0 auto" mt={2}>
          <Box
            sx={{
              backgroundColor: "#1f618d",
              padding: "10px 20px",
              borderRadius: "8px 8px 0 0",
            }}
          >
            <Typography variant="h5" fontWeight="bold" color="white">
              Inventario
            </Typography>
          </Box>

          <Paper sx={{ width: "100%", margin: "0 auto" }}>
            <TableContainer
              sx={{ maxHeight: "600px", backgroundColor: "#eaeded" }}
            >
              <Box sx={{ overflowX: "auto" }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      {[
                        "Codigo",
                        "Producto",
                        "Grupo",
                        "Unidad de medida",
                        "Precio",
                        "Cantidad",
                        "Subtotal",
                      ].map((header) => (
                        <TableCell
                          key={header}
                          align={
                            ["Precio", "Cantidad", "Subtotal"].includes(
                              header
                            )
                              ? "right"
                              : "left"
                          }
                          sx={{
                            fontWeight: "bold",
                            backgroundColor: "#f4f6f7",
                            color: "black",
                            minWidth: 100,
                          }}
                        >
                          {header}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {sortedInventario.map((producto) => (
                      <TableRow key={producto.id}>
                        <TableCell align="left">{producto.codigo}</TableCell>
                        <TableCell align="left">
                          {producto.nombreProducto}
                        </TableCell>
                        <TableCell align="left">
                          {producto.nombreGrupo}
                        </TableCell>
                        <TableCell align="left">
                          {producto.unidadMedida}
                        </TableCell>
                        <TableCell align="right">
                          {formatearDinero(producto.costoUnitario)}
                        </TableCell>
                        <TableCell align="right">
                          {formatearNumero(producto.cantidad)}
                        </TableCell>
                        <TableCell align="right">
                          {formatearDinero(
                            producto.cantidad * producto.costoUnitario
                          )}
                        </TableCell>
                      </TableRow>
                    ))}

                    {/* fila para el total, la suma de los subtotales de cada producto */}
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        align="right"
                        sx={{ fontWeight: "bold" }}
                      >
                        Total en inventario:
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: "bold" }}>
                        {formatearDinero(
                          sortedInventario.reduce(
                            (total, producto) =>
                              total +
                              producto.cantidad * producto.costoUnitario,
                            0
                          )
                        )}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Box>
            </TableContainer>
          </Paper>
        </Box>
      </animated.div>
    </>
  );
};
