import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios'; // Para hacer las solicitudes HTTP

// Acción asincrónica para manejar el login
export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await axios.post('${import.meta.env.VITE_API_URL}/users/login', credentials, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Almacenar los datos en localStorage al realizar el login exitoso
    localStorage.setItem('user', JSON.stringify(response.data.user));
    localStorage.setItem('accessToken', response.data.accessToken);

    return response.data;
  } catch (err) {
    if (err.response && err.response.data) {
      return rejectWithValue(err.response.data.error);
    } else {
      return rejectWithValue(err.message);
    }
  }
});

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null, // Obtener el usuario desde localStorage
  accessToken: localStorage.getItem('accessToken') || null, // Obtener el token desde localStorage
  status: 'idle',
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      localStorage.removeItem('user'); // Limpiar el localStorage al cerrar sesión
      localStorage.removeItem('accessToken');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Error en la autenticación';
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
