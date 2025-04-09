import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { buscarProducto } from "../../api/almacenProductosApi";

export const ModalBuscarProductos = ({ open, onClose, onSelect }) => {
  const [codigo, setCodigo] = useState("");
  const [productoEncontrado, setProductoEncontrado] = useState(null);

  // Buscar producto por código
  const handleBuscar = async () => {
    if (!codigo.trim()) return;
    const producto = await buscarProducto(codigo);
    setProductoEncontrado(producto || null);
  };

  // Manejar selección del producto
  const handleSeleccionar = () => {
    console.log("Modal, costoUnitario",productoEncontrado.precio)
    console.log("productoEncontrado",productoEncontrado)
    if (productoEncontrado) {
      onSelect({
        ...productoEncontrado,
        costo_unitario: productoEncontrado.precio, // Pasar el precio como costo_unitario

      });
      handleCerrarModal(); // Cerrar y reiniciar estado
    }
  };

  // Cerrar y limpiar el modal
  const handleCerrarModal = () => {
    setCodigo(""); // Limpiar el código ingresado
    setProductoEncontrado(null); // Reiniciar producto encontrado
    onClose(); // Cerrar modal
  };

  return (
    <Modal open={open} onClose={handleCerrarModal}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 500,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Buscar Producto
        </Typography>

        {/* Campo para ingresar el código */}
        <TextField
          label="Código del Producto"
          variant="outlined"
          fullWidth
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleBuscar()} // Buscar con Enter
          sx={{ mb: 2 }}
        />
        <Button onClick={handleBuscar} variant="contained" fullWidth sx={{ mb: 2 }}>
          Buscar
        </Button>

        {/* Mostrar el producto encontrado */}
        {productoEncontrado ? (
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell>Precio</TableCell>
                  <TableCell>Acción</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>{productoEncontrado.nombre}</TableCell>
                  <TableCell>{productoEncontrado.descripcion}</TableCell>
                  <TableCell>${productoEncontrado.precio}</TableCell>
                  <TableCell>
                    <Button variant="contained" size="small" onClick={handleSeleccionar}>
                      Seleccionar
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          codigo && (
            <Typography variant="body2" sx={{ mt: 2, color: "red" }}>
              No se encontró un producto con ese código.
            </Typography>
          )
        )}

        <Button onClick={handleCerrarModal} sx={{ mt: 2 }} variant="outlined" fullWidth>
          Cerrar
        </Button>
      </Box>
    </Modal>
  );
};
