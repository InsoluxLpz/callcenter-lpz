import React, { useEffect, useState } from "react";
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Collapse, Typography } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import Swal from 'sweetalert2';

const drawerWidth = 250;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

export const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(location.pathname);

  const nombreUsuario = localStorage.getItem("usuario")
  console.log(nombreUsuario)

  useEffect(() => {
    setSelectedItem(location.pathname);
  }, [location.pathname]);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Cerrar Sesión",
      text: "¿Quieres cerrar sesión?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#f1c40f",
      cancelButtonColor: "#7f8c8d",
      confirmButtonText: "Sí,Cerrar",
      cancelButtonText: "Cancelar"
    });

    if (result.isConfirmed) {
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      localStorage.removeItem("url_lista");
      localStorage.removeItem("url_name");
      navigate("/");
    }
  };

  const routeTitles = {
    "/Inicio": `Extensión: ${nombreUsuario}`,
  };

  const currentTitle = routeTitles[location.pathname] || "Inicio";

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        open={open}
        style={{ backgroundColor: "#1b2631" }}
      >
        <Toolbar>
          {/* Título con flexGrow para empujar el contenido a la derecha */}
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            {currentTitle}
          </Typography>

          {/* Caja alineada a la derecha para el botón de logout */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <ListItem button onClick={handleLogout}>
              <Button sx={{ minWidth: 50 }}>
                <LogoutIcon sx={{ fontSize: 30, color: "red" }} />
              </Button>
              <ListItemText
                primary="Cerrar sesión"
                sx={{ color: "red", display: open ? "block" : "none" }}
              />
            </ListItem>
          </Box>
        </Toolbar>
      </AppBar>

      <List />

      <Box
        sx={{
          flexGrow: 1,
          bgcolor: "background.default",
          paddingTop: "60px",
        }}
      ></Box>
    </Box>
  );
}