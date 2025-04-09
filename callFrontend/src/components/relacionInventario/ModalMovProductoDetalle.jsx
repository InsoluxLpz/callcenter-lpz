import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
} from "@mui/material";

export const ModalMovProductoDetalle = ({ open, handleClose, detalle }) => {
  if (!detalle) return null;

  const getColorByTipoMovimiento = (tipo) => {
    return tipo === "ENTRADA" ? "#1f618d" : "#922b21"; // Azul para entrada, Rojo para salida
  };

  const getTextColorByTipoMovimiento = (tipo) => {
    return tipo === "ENTRADA" ? "#1565c0" : "#c62828"; // Azul fuerte para entrada, Rojo fuerte para salida
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      {/* Encabezado */}
      <Box
        sx={{
          backgroundColor: detalle.tipoMovimiento
            ? getColorByTipoMovimiento(detalle.tipoMovimiento)
            : "#ccc", // Color gris mientras carga
          padding: "10px 20px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <Typography variant="h5" fontWeight="bold" color="white">
          {`DETALLES DEL MOVIMIENTO/PRODUCTO #${detalle.idMovimiento}`}
        </Typography>
      </Box>

      {/* Contenido */}
      <DialogContent dividers>
        <Box
          sx={{
            borderRadius: "12px",
            padding: 3,
            backgroundColor: "#f9f9f9", // Fondo suave
            boxShadow: 3,
          }}
        >
          {/* Información general del movimiento */}
          <Typography
            variant="body1"
            fontWeight="bold"
            sx={{
              color: getTextColorByTipoMovimiento(detalle.tipoMovimiento),
            }}
          >
            <strong>Fecha:</strong>{" "}
            {new Date(detalle.fecha_movimiento).toLocaleDateString("es-MX")}
          </Typography>

          <Typography
            variant="body1"
            fontWeight="bold"
            sx={{
              color: getTextColorByTipoMovimiento(detalle.tipoMovimiento),
            }}
          >
            {detalle.origen_movimiento} Realizado por {detalle.nombreUsuario}.
          </Typography>
          <Divider sx={{ my: 2 }} />

          {/* Detalles del movimiento */}
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Se realizó un movimiento de {detalle.tipoMovimiento} por{" "}
            {detalle.tipoSubMovimiento} de {detalle.cantidad}{" "}
            {detalle.nombreProducto} con el costo de ${detalle.costo_unitario}{" "}
            pesos por {detalle.nombreUnidadMedida}. Anteriormente había un total
            de {detalle.existencia_anterior} {detalle.nombreProducto}, con la
            cantidad{" "}
            {detalle.tipoMovimiento === "ENTRADA"
              ? `ingresada `
              : `saliente `}{" "}
            se modificó a {detalle.existencia_nueva} {detalle.nombreProducto}
            <hr />
            El stock actual es: {detalle.stock_actual} {detalle.nombreProducto}.
          </Typography>
        </Box>
      </DialogContent>

      {/* Botón de cerrar */}
      <DialogActions>
  <Button
    onClick={handleClose}
    variant="contained"
    sx={{
      color: "white", // Texto blanco para buen contraste
      backgroundColor: getColorByTipoMovimiento(detalle.tipoMovimiento), // Fondo basado en el tipo
      "&:hover": {
        backgroundColor: getTextColorByTipoMovimiento(detalle.tipoMovimiento), // Fondo más fuerte al pasar el mouse
      },
    }}
  >
    Cerrar
  </Button>
</DialogActions>

    </Dialog>
  );
};
