import React, { useEffect, useState } from "react";
import {
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  Grid,
} from "@mui/material";
import { cargarListasMovimientosDetalles } from "../../api/almacenProductosApi"; // Importar API correctamente

export const ModalMovimientosDetalles = ({ open, onClose, idMovimiento }) => {
  const [detalleMovimiento, setDetalleMovimiento] = useState([]);
  const [movimientoInfo, setMovimientoInfo] = useState(null);

  useEffect(() => {
    if (open && idMovimiento) {
      fetchDetallesMovimiento();
    }
  }, [open, idMovimiento]);

  const fetchDetallesMovimiento = async () => {
    try {
      const data = await cargarListasMovimientosDetalles(idMovimiento);

      // Separar los detalles del movimiento y los datos generales
      const movimientoData = data.length > 0 ? data[0] : null;
      const detalles = data.length > 0 ? data : [];

      setMovimientoInfo(movimientoData);
      setDetalleMovimiento(detalles);
    } catch (error) {
      console.error("Error al obtener detalles del movimiento:", error);
    }
  };

  const formatearDinero = (valor) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(valor);
  };

  const getColorByTipoMovimiento = (tipo) => {
    return tipo === "ENTRADA" ? "#1f618d" : "#922b21"; // Azul para entrada, Rojo para salida
  };

  const getTextColorByTipoMovimiento = (tipo) => {
    return tipo === "ENTRADA" ? "#1565c0" : "#c62828"; // Azul fuerte para entrada, Rojo fuerte para salida
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      {/* open={open}
      onClose={onClose}
      maxWidth="sm" // Reduce el ancho máximo
      sx={{
        "& .MuiDialog-paper": {
          maxWidth: "1000px", // Ajusta el ancho máximo del modal
          minWidth: "1000px", // Ajusta el ancho mínimo si es necesario
          maxHeight: "600px", // Ajusta la altura máxima del modal
          borderRadius: "12px", // Bordes redondeados
          padding: "10px", // Espaciado interno
        },
      }}
    > */}
      {/* Encabezado */}
      <Box
        sx={{
          backgroundColor: movimientoInfo
            ? getColorByTipoMovimiento(movimientoInfo.tipo_movimiento)
            : "#ccc", // Color gris mientras carga
          padding: "10px 20px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <Typography variant="h5" fontWeight="bold" color="white">
          {movimientoInfo
            ? `DETALLES DEL MOVIMIENTO #${idMovimiento}`
            : "Cargando..."}
        </Typography>
      </Box>

      {/* Contenido */}
      <DialogContent dividers>
        {movimientoInfo && (
          <>
            {/* Dividir en dos columnas */}
            <Box
              component={Paper}
              sx={{
                borderRadius: "12px",
                padding: 3,
                backgroundColor: "#f9f9f9", // Fondo suave
                boxShadow: 3,
              }}
            >
              <Grid container spacing={2}>
                {[
                  {
                    label: "Fecha",
                    value: new Date(movimientoInfo.fecha).toLocaleDateString(
                      "es-MX"
                    ),
                  },
                  {
                    label: "Realizó movimiento",
                    value: movimientoInfo.usuario,
                  },
                  {
                    label: "Tipo de movimiento",
                    value: movimientoInfo.tipo_movimiento,
                  },
                  { label: "Método", value: movimientoInfo.tipoSubMovimiento },
                ].map((item, index) => (
                  <Grid item xs={6} key={index}>
                    <Typography
                      variant="body1"
                      fontWeight="bold"
                      sx={{
                        color: getTextColorByTipoMovimiento(
                          movimientoInfo.tipo_movimiento
                        ),
                      }}
                    >
                      {item.label}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "text.secondary",
                      }}
                    >
                      {item.value}
                    </Typography>
                    {index % 2 !== 0 && <Divider sx={{ mt: 1 }} />}
                  </Grid>
                ))}
              </Grid>

              {/* Autorizado centrado */}
              <Box
                display="flex"
                justifyContent="rigth"
                alignItems="center"
                sx={{
                  borderTop: "1px solid #ddd",
                  paddingTop: 2,
                  marginTop: 2,
                }}
              >
                <Typography
                  variant="body1"
                  fontWeight="bold"
                  sx={{
                    color: getTextColorByTipoMovimiento(
                      movimientoInfo.tipo_movimiento
                    ),
                  }}
                  align="left"
                >
                  Autorizó:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ marginLeft: 1, color: "text.primary" }}
                >
                  {movimientoInfo.autorizado_por}
                </Typography>
              </Box>
            </Box>

            {/* Contenedor de la tabla con scroll */}
            <Box
              sx={{
                marginTop: 3,
                borderRadius: "8px",
                border: "1px solid #ddd",
                overflow: "hidden", // Evita que se solapen los bordes
              }}
            >
              {/* Contenedor con scroll para la tabla */}
              <Box
                sx={{
                  maxHeight: "300px", // Altura máxima con scroll
                  overflowY: "auto", // Habilita el scroll vertical
                }}
              >
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: "#f2f2f2" }}>
                        <TableCell align="left">
                          <Typography
                            variant="body1"
                            fontWeight="bold"
                            sx={{
                              color: getColorByTipoMovimiento(
                                movimientoInfo.tipo_movimiento
                              ),
                            }}
                          >
                            #
                          </Typography>
                        </TableCell>
                        <TableCell align="left">
                          <Typography
                            variant="body1"
                            fontWeight="bold"
                            sx={{
                              color: getColorByTipoMovimiento(
                                movimientoInfo.tipo_movimiento
                              ),
                            }}
                          >
                            Producto
                          </Typography>
                        </TableCell>
                        <TableCell align="left">
                          <Typography
                            variant="body1"
                            fontWeight="bold"
                            sx={{
                              color: getColorByTipoMovimiento(
                                movimientoInfo.tipo_movimiento
                              ),
                            }}
                          >
                            Cantidad
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            variant="body1"
                            fontWeight="bold"
                            sx={{
                              color: getColorByTipoMovimiento(
                                movimientoInfo.tipo_movimiento
                              ),
                            }}
                          >
                            Costo Unitario
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            variant="body1"
                            fontWeight="bold"
                            sx={{
                              color: getColorByTipoMovimiento(
                                movimientoInfo.tipo_movimiento
                              ),
                            }}
                          >
                            Subtotal
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {detalleMovimiento.length > 0 ? (
                        detalleMovimiento.map((detalle, index) => (
                          <TableRow key={`producto-${index}`}>
                            <TableCell align="left">{index + 1}</TableCell>
                            <TableCell align="left">
                              {detalle.producto}
                            </TableCell>
                            <TableCell align="left">
                              {detalle.cantidad}
                            </TableCell>
                            <TableCell align="right">
                              {formatearDinero(detalle.costo_unitario)}
                            </TableCell>
                            <TableCell align="right">
                              {formatearDinero(detalle.subtotal)}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} align="center">
                            No hay detalles disponibles.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              {/* Sección fija para el total */}
              <Box
                sx={{
                  backgroundColor: "#f2f2f2",
                  padding: 2,
                  display: "flex",
                  justifyContent: "flex-end",
                  borderTop: "1px solid #ddd",
                  paddingLeft: "10px", // Aumenta el espacio interno a la izquierda
                }}
              >
                <Typography
                  variant="body1"
                  fontWeight="bold"
                  sx={{
                    color: getTextColorByTipoMovimiento(
                      movimientoInfo.tipo_movimiento
                    ),
                  }}
                >
                  Total: {formatearDinero(movimientoInfo.total)}
                </Typography>
              </Box>
            </Box>
          </>
        )}
      </DialogContent>

      {/* Botón de cerrar */}
      <DialogActions>
        <Button onClick={onClose} color="primary" variant="contained">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
