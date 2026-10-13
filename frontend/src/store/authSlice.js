import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

const persist = (data) => {
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
  localStorage.setItem('user', JSON.stringify({
    userId: data.userId, email: data.email,
    firstName: data.firstName, lastName: data.lastName, roles: data.roles,
  }));
};

const clearPersist = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try { const { data } = await api.post('/auth/login', credentials); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Login failed'); }
});

export const register = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
  try { const { data } = await api.post('/auth/register', payload); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Registration failed'); }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  try { await api.post('/auth/logout'); } catch {}
  finally { clearPersist(); }
});

const storedUser = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })();

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: storedUser, loading: false, error: null },
  reducers: { clearError: (state) => { state.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(login.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.user = { userId: payload.userId, email: payload.email, firstName: payload.firstName, lastName: payload.lastName, roles: payload.roles };
        persist(payload);
      })
      .addCase(login.rejected, (state, { payload }) => { state.loading = false; state.error = payload; })
      .addCase(register.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(register.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.user = { userId: payload.userId, email: payload.email, firstName: payload.firstName, lastName: payload.lastName, roles: payload.roles };
        persist(payload);
      })
      .addCase(register.rejected, (state, { payload }) => { state.loading = false; state.error = payload; })
      .addCase(logout.fulfilled, (state) => { state.user = null; })
      .addCase(logout.rejected, (state) => { state.user = null; });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
