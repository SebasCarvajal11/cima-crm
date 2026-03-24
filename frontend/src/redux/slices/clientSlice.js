import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Acción para obtener todos los clientes
export const fetchClients = createAsyncThunk('clients/fetchAll', async () => {
  const response = await axios.get('/api/users');
  return response.data;
});

// Acción para obtener el historial de un cliente
export const fetchClientHistory = createAsyncThunk('clients/fetchHistory', async (clientId) => {
  const response = await axios.get(`/api/clients/${clientId}/history`);
  return response.data;
});

// Acción para obtener un cliente por ID
export const getClientById = createAsyncThunk('clients/getById', async (clientId) => {
  const response = await axios.get(`/api/clients/${clientId}`);
  return response.data;
});

// Acción para crear un cliente
export const createClient = createAsyncThunk('clients/create', async (newClient) => {
  const response = await axios.post(`${import.meta.env.VITE_API_URL}/users/register`, newClient,{
    headers:{
      'accesstoken':localStorage.getItem('accessToken'),
    }
  });
  return response.data;
});

// Acción para actualizar un cliente
export const updateClient = createAsyncThunk('clients/update', async ({ id, updatedClient }) => {
  const response = await axios.put(`${import.meta.env.VITE_API_URL}/clients/${id}`, updatedClient,{
    headers:{
      'accesstoken':localStorage.getItem('accessToken'),
    }
  });
  return response.data;
});

// Acción para eliminar un cliente
export const deleteClient = createAsyncThunk('clients/delete', async (clientId, { rejectWithValue }) => {
  try {
    const response = await axios.delete(`${import.meta.env.VITE_API_URL}/clients/${clientId}`, {
      headers: {
        'accesstoken': localStorage.getItem('accessToken'),
      },
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      // Si el servidor devuelve una respuesta de error con detalles
      return rejectWithValue(error.response.data);
    } else {
      // Si hay un error de red u otro tipo de error sin respuesta clara del servidor
      return rejectWithValue({ message: 'Error en el servidor. Intenta nuevamente más tarde.' });
    }
  }
});

const clientSlice = createSlice({
  name: 'clients',
  initialState: {
    clients: [],
    client: null,
    history: [],
    status: 'idle',
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchClients.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.clients = action.payload;
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchClientHistory.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchClientHistory.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.history = action.payload;
      })
      .addCase(fetchClientHistory.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(getClientById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getClientById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.client = action.payload;
      })
      .addCase(getClientById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(createClient.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createClient.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.clients.push(action.payload);  // Agregar nuevo cliente a la lista
      })
      .addCase(createClient.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(updateClient.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateClient.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.clients.findIndex(client => client.id === action.payload.id);
        if (index !== -1) {
          state.clients[index] = action.payload;  // Actualizar cliente en la lista
        }
      })
      .addCase(updateClient.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(deleteClient.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteClient.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.clients = state.clients.filter(client => client.id !== action.meta.arg);
      })
      .addCase(deleteClient.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  }
});

export default clientSlice.reducer;
