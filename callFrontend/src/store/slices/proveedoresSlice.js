import { createSlice } from '@reduxjs/toolkit';

export const proveedoresSlice = createSlice({
  name: 'proveedores',
  initialState: {
    isLoadingProveedores: true,
    proveedores: [],  // Asegúrate de que esta propiedad sea 'proveedores'
    activeCliente: null
  },
  reducers: {
    onSetActiveProovedores: (state, { payload }) => {
        console.log("entro en el slice de activar")
      state.activeCliente = payload;
    },
    onAgregarProveedor: (state, { payload }) => {
        console.log("entro en el slice de agregar")
      state.proveedores.push(payload); // Cambié 'proveedores' por 'proveedores'
      state.activeProveedor = null;
    },
    onActualizarProveedores: (state, { payload }) => {
        console.log("entro en el slice de actualizar")
      state.proveedores = state.proveedores.map(proveedor => {
        if (proveedor.id === payload.id) {
          return payload;
        }
        return proveedor;
      });
    },
    onMostrarProveedores: (state, { payload }) => {
        console.log("entro en el slice de mostrar")
      state.isLoadingProveedores = false;

      payload.forEach(proveedor => {
        const existe = state.proveedores.some(dbProveedor => dbProveedor.id === proveedor.id);  // Cambié 'proveedor' por 'proveedores'
        if (!existe) {
          state.proveedores.push(proveedor);  // Cambié 'proveedor' por 'proveedores'
        }
      });
    },
  },
});

export const {
  onSetActiveProovedores,
  onAgregarProveedor,
  onActualizarProveedores,
  onMostrarProveedores,
} = proveedoresSlice.actions;
