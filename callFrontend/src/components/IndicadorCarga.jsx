// IndicadorCarga.jsx
import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const IndicadorCarga = ({ progreso, cargando }) => {
  if (!cargando) return null; // No muestra nada si no está cargando

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <CircularProgress
        variant="determinate"
        value={progreso}
        size={60}
        thickness={5}
        sx={{ color: '#3f51b5', marginBottom: 1 }}
      />
      <Typography variant="subtitle2" color="textSecondary">
        {`${Math.round(progreso)}%`}
      </Typography>
    </Box>
  );
};

export default IndicadorCarga;
