import { configureStore } from '@reduxjs/toolkit';
import {proveedoresSlice} from './slices/proveedoresSlice';

export const store = configureStore({
  reducer: {
    proveedores: proveedoresSlice.reducer
  },

  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: false
})
});
