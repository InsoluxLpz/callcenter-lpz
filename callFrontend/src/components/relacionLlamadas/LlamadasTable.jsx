import React, { useState } from "react";
import CommentIcon from '@mui/icons-material/Comment';
import PhoneEnabledIcon from '@mui/icons-material/PhoneEnabled';
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import { TableVirtuoso } from "react-virtuoso";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { Box, IconButton, Typography, } from "@mui/material";
import { NavBar } from "../NavBar";
import { useSpring, animated } from "@react-spring/web";
import { ComentarioModal } from "./ComentarioModal";

const columns = [
  { label: "#" },
  { label: "No.Cliente" },
  { label: "Nombre" },
  { label: "Celular" },
  { label: "Estatus" },
  { label: "Acciones" },
];

const clientes = [
  { noCliente: "CL-100", nombre: "Cliente 1", celular: "55-0000-0000", estatus: "Activo" },
  { noCliente: "CL-101", nombre: "Cliente 2", celular: "55-0000-0001", estatus: "Inactivo" },
  { noCliente: "CL-102", nombre: "Cliente 3", celular: "55-0000-0002", estatus: "Activo" },
  { noCliente: "CL-103", nombre: "Cliente 4", celular: "55-0000-0003", estatus: "Inactivo" },
  { noCliente: "CL-104", nombre: "Cliente 5", celular: "55-0000-0004", estatus: "Activo" },
  { noCliente: "CL-105", nombre: "Cliente 6", celular: "55-0000-0005", estatus: "Inactivo" },
  { noCliente: "CL-106", nombre: "Cliente 7", celular: "55-0000-0006", estatus: "Activo" },
];

export const LlamadasTable = () => {
  const [openModalComentar, setOpenModalComentar] = useState(false);

  const abrirModal = () => setOpenModalComentar(true);
  const cerrarModal = () => setOpenModalComentar(false);

  const styles = useSpring({
    from: { opacity: 0, transform: "translateY(50px)", filter: "blur(10px)" },
    to: { opacity: 1, transform: "translateY(0)", filter: "blur(0px)" },
    config: { tension: 500, friction: 30 },
  });

  return (
    <>
      <Box sx={{ backgroundColor: "#f2f3f4", minHeight: "100vh", paddingBottom: 4 }}>
        <NavBar />

        <animated.div style={styles}>
          <Box width="90%" maxWidth={2000} margin="0 auto" mt={4}>
            <Box sx={{ backgroundColor: "#212f3c", padding: "10px 20px", borderRadius: "8px 8px 0 0" }}>
              <Typography variant="h5" color="white">
                Lista de Clientes
              </Typography>
            </Box>

            <Paper sx={{ width: "100%", overflow: "hidden" }}>
              <TableVirtuoso
                data={clientes}
                style={{ height: 560 }}
                components={{
                  Scroller: React.forwardRef((props, ref) => (
                    <TableContainer component={Box} ref={ref} {...props} />
                  )),
                  Table: (props) => (
                    <Table stickyHeader sx={{ width: "100%" }} {...props} />
                  ),
                  TableHead,
                  TableRow,
                  TableBody,
                }}
                fixedHeaderContent={() => (
                  <TableRow>
                    {columns.map((col) => (
                      <TableCell
                        key={col.label}
                        sx={{
                          width: col.width,
                          backgroundColor: "#f4f6f7",
                          fontWeight: "bold",
                          color: "black",
                        }}
                      >
                        {col.label}
                      </TableCell>
                    ))}
                  </TableRow>
                )}
                itemContent={(index, cliente) => (
                  <>
                    <TableCell sx={{ width: "5%" }}>{index + 1}</TableCell>
                    <TableCell sx={{ width: "15%" }}>{cliente.noCliente}</TableCell>
                    <TableCell sx={{ width: "25%" }}>{cliente.nombre}</TableCell>
                    <TableCell sx={{ width: "20%" }}>{cliente.celular}</TableCell>
                    <TableCell sx={{ width: "15%" }}>{cliente.estatus}</TableCell>
                    <TableCell sx={{ width: "20%" }}>
                      <IconButton sx={{ color: "#229954" }}>
                        <PhoneEnabledIcon sx={{ fontSize: 25 }} />
                      </IconButton>
                      <IconButton sx={{ marginLeft: 1, color: "#17202a" }} onClick={abrirModal}>
                        <CommentIcon sx={{ fontSize: 25 }} />
                      </IconButton>
                    </TableCell>
                  </>
                )}
              />
            </Paper>
          </Box>
        </animated.div>

        <ComentarioModal onClose={cerrarModal} modalOpen={openModalComentar} />
      </Box>
    </>
  );
};
