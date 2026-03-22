import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import clientReducer from './slices/clientSlice';
import roleReducer from './slices/roleSlice'; // Importar roleSlice

export const store = configureStore({
  reducer: {
    auth: authReducer,
    clients: clientReducer,
    roles: roleReducer,

  }
});
