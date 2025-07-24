import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage'; // Lo crearemos ahora
import InformeDetailPage from './pages/InformeDetailPage'; // Lo crearemos ahora
import PrivateRoute from './components/PrivateRoute';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

const theme = createTheme();

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            
            {/* Rutas Protegidas */}
            <Route element={<PrivateRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/informe/:id" element={<InformeDetailPage />} />
              {/* Redirigir la ruta raíz al dashboard si está autenticado */}
              <Route path="/" element={<DashboardPage />} />
            </Route>

          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;