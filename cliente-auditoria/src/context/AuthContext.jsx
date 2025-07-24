import React, { createContext, useState, useEffect } from 'react';
import { api } from '../api/apiService'; // Lo crearemos a continuación

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      // Si hay un token, configuramos el header por defecto en axios
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Aquí podrías añadir una llamada a un endpoint /api/auth/profile para verificar
      // el token y obtener los datos frescos del usuario al recargar la página.
      // Por simplicidad, por ahora decodificaremos el token.
      try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setUser({ id: payload.id, rol: payload.rol, equipoId: payload.equipoId });
      } catch(e) {
          // Token inválido, lo limpiamos
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
      }
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token: authToken } = response.data;
    localStorage.setItem('token', authToken);
    setToken(authToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    const payload = JSON.parse(atob(authToken.split('.')[1]));
    setUser({ id: payload.id, rol: payload.rol, equipoId: payload.equipoId });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
  };

  const value = { user, token, login, logout, isAuthenticated: !!token };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;