import React, { useState } from "react";
import AddchartIcon from '@mui/icons-material/Addchart';
import EditIcon from "@mui/icons-material/Edit";
import InventoryIcon from "@mui/icons-material/Inventory";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { Box, Button, FormControlLabel, IconButton, Switch, TextField, Typography, } from "@mui/material";
import { ActualizarStatus, obtenerMotos } from "../../api/motosApi";
import { useEffect } from "react";
import { NavBar } from "../NavBar";
import { obtenerMarcas } from "../../api/marcasApi";
import { MarcasModal } from "./MarcasModal";
import { EditarModal } from "./EditarModal";
import { AgregarModal } from "./AgregarModal";
import { useSpring, animated } from "@react-spring/web";

export const MotosTable = () => {
  const [openModalEditar, setOpenModalEditar] = useState(false);
  const [openModalAgregar, setOpenModalAgregar] = useState(false);
  const [openModalMarcas, setOpenModalMarcas] = useState(false);
  const [motos, setMotos] = useState([]);
  const [motoSeleccionada, setMotoSeleccionada] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [marcas, setMarcas] = useState([]);
  const [searchInciso, setSearchInciso] = useState("");
  const [searchNoSerie, setSearchNoSerie] = useState("");
  const [searchPlaca, setSearchPlaca] = useState("");


  const handleActualizarStatus = (id) => {
    ActualizarStatus(id, (idActualizado) => {
      setMotos((motosActuales) =>
        motosActuales.map((moto) =>
          moto.id === idActualizado ? { ...moto, status: 0 } : moto
        )
      );
    });
  };

  const fetchMotos = async () => {
    const data = await obtenerMotos();
    if (data) {
      // Ordenar las motos por inciso antes de setear el estado
      const sortedData = data.sort((a, b) =>
        a.inciso.localeCompare(b.inciso, undefined, { numeric: true })
      );
      setMotos(sortedData);
    }
  };

  useEffect(() => {
    fetchMotos();
  }, []);



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
        <NavBar onSearch={setSearchTerm} />
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
                    {motos.map((moto) => (
                      <TableRow key={moto.id} sx={{ backgroundColor: "#eaecee " }}>
                        <TableCell sx={{ textAlign: "left" }}>{moto.inciso}</TableCell>
                        <TableCell sx={{ textAlign: "left" }}>{moto.modelo?.toUpperCase()}</TableCell>
                        <TableCell sx={{ textAlign: "left" }}>{moto.no_serie?.toUpperCase()}</TableCell>
                        <TableCell sx={{ textAlign: "left" }}>{moto.placa?.toUpperCase()}</TableCell>
                        <TableCell sx={{ textAlign: "left" }}>{moto.propietario?.toUpperCase()}</TableCell>
                        <TableCell sx={{ textAlign: "left" }}>{moto.nota?.toUpperCase()}</TableCell>
                        <TableCell sx={{ textAlign: "left" }}>
                          <IconButton onClick={() => handleOpenModalEdit(moto)}>
                            <EditIcon sx={{ fontSize: 20 }} />
                          </IconButton>
                          <IconButton color="error" sx={{ marginLeft: 1 }} onClick={() => handleActualizarStatus(moto.id)}>
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
      </Box>
    </>
  );
};