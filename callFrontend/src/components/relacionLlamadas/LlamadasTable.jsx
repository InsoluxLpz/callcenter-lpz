import React, { useState } from "react";
import CommentIcon from '@mui/icons-material/Comment';
import PhoneEnabledIcon from '@mui/icons-material/PhoneEnabled';
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { Box, Button, FormControlLabel, IconButton, Switch, TextField, Typography, } from "@mui/material";
import { NavBar } from "../NavBar";
import { useSpring, animated } from "@react-spring/web";
import { ComentarioModal } from "./ComentarioModal";

export const LlamadasTable = () => {

  const [openModalComentar, setOpenModalComentar] = useState(false);

  const abrirModal = () => {
    setOpenModalComentar(true);
  }

  const cerrarModal = () => {
    setOpenModalComentar(false);
  }

  // * diseño de carga en las tablas
  const styles = useSpring({
    from: { opacity: 0, transform: "translateY(50px)", filter: "blur(10px)" },
    to: { opacity: 1, transform: "translateY(0)", filter: "blur(0px)" },
    config: { tension: 500, friction: 30 },
  });

  return (
    <>
      <Box
        sx={{ backgroundColor: "#f2f3f4", minHeight: "100vh", paddingBottom: 4, transition: "margin 0.3s ease-in-out" }}
      >
        <NavBar />
        <animated.div style={styles}>

          <Box width="90%" maxWidth={2000} margin="0 auto" mt={4}>

            <Box sx={{ backgroundColor: "#1f618d", padding: "10px 20px", borderRadius: "8px 8px 0 0" }}>
              <Typography variant="h5" color="white">
                Lista de Motos
              </Typography>
            </Box>

            <Paper sx={{ width: "100%", maxWidth: "2000px", margin: "0 auto", backgroundColor: "white", padding: 2 }}>
              <TableContainer sx={{ maxHeight: 560, backgroundColor: "#ffff", border: "1px solid #d7dbdd", borderRadius: "2px" }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      {["Inciso", "Modelo", "N.Serie", "Placa", "Propietario", "Nota", "Acciones"].map((col) => (
                        <TableCell key={col} sx={{ backgroundColor: "#f4f6f7", color: "black", textAlign: "left", fontWeight: "bold" }}>
                          {col}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>

                    <TableRow sx={{ backgroundColor: "#eaecee " }}>
                      <TableCell sx={{ textAlign: "left" }}></TableCell>
                      <TableCell sx={{ textAlign: "left" }}></TableCell>
                      <TableCell sx={{ textAlign: "left" }}></TableCell>
                      <TableCell sx={{ textAlign: "left" }}></TableCell>
                      <TableCell sx={{ textAlign: "left" }}></TableCell>
                      <TableCell sx={{ textAlign: "left" }}></TableCell>
                      <TableCell sx={{ textAlign: "left" }}>
                        <IconButton sx={{ color: "#229954" }}>
                          <PhoneEnabledIcon sx={{ fontSize: 25 }} />
                        </IconButton>
                        <IconButton sx={{ marginLeft: 1, color: "#17202a" }} onClick={() => abrirModal()} >
                          <CommentIcon sx={{ fontSize: 25 }} />
                        </IconButton>
                      </TableCell>
                    </TableRow>

                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        </animated.div>
        <ComentarioModal onClose={cerrarModal} modalOpen={openModalComentar} />
      </Box>
    </>
  );
};