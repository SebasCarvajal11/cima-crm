import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Thunk para obtener la lista de usuarios
export const fetchUsers = createAsyncThunk('roles/fetchUsers', async () => {
  const response = await axios.get('/api/users'); // Cambia a tu endpoint real
  return response.data;
});

// Thunk para actualizar el rol de un usuario
export const updateRole = createAsyncThunk(
  'roles/updateRole',
  async ({ userId, role }) => {
    const response = await axios.put(`/api/users/${userId}/role`, { role }); // Cambia a tu endpoint real
    return response.data;
  }
);
const roleSlice = createSlice({
    name: 'roles',
    initialState: {
      users: [], // Asegúrate de inicializar como array vacío
      loading: false,
      error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
      builder
        .addCase(fetchUsers.pending, (state) => {
          state.loading = true;
        })
        .addCase(fetchUsers.fulfilled, (state, action) => {
          state.loading = false;
          state.users = action.payload || []; // Asegúrate de que la respuesta es un array
        })
        .addCase(fetchUsers.rejected, (state, action) => {
          state.loading = false;
          state.error = action.error.message;
        });
    },
  });
  

export default roleSlice.reducer;
