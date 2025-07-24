import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api/apiService';
import { useAuth } from '../hooks/useAuth';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Box,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const DashboardPage = () => {
  const [informes, setInformes] = useState([]);
  const [loading, setLoading] = useState(true);
  const auth = useAuth();

  // --- Lógica para el modal de creación ---
  const [open, setOpen] = useState(false);
  const [newInformeData, setNewInformeData] = useState({ titulo: '', descripcion: '' });
  const [error, setError] = useState('');

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setNewInformeData({ titulo: '', descripcion: '' }); // Limpiar formulario al cerrar
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewInformeData(prevState => ({ ...prevState, [name]: value }));
  };

  const fetchInformes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/informes');
      setInformes(response.data);
    } catch (error) {
      console.error("Error al cargar informes:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInformes();
  }, [fetchInformes]);

  const handleCreateInforme = async () => {
    if (!newInformeData.titulo) {
      setError('El título es obligatorio.');
      return;
    }
    try {
      await api.post('/informes', newInformeData);
      handleClose(); // Cierra el modal
      fetchInformes(); // Vuelve a cargar la lista de informes para mostrar el nuevo
    } catch (err) {
      console.error('Error al crear el informe:', err);
      setError('No se pudo crear el informe. Inténtelo de nuevo.');
    }
  };


  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 4 }}>
        <Typography variant="h4" component="h1">
          Panel de Informes
        </Typography>
        <Button variant="contained" color="error" onClick={auth.logout}>
          Cerrar Sesión
        </Button>
      </Box>

      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleClickOpen}
        sx={{ mb: 2 }}
      >
        Crear Nuevo Informe
      </Button>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
        </Box>
      ) : (
        <List>
          {informes.length > 0 ? informes.map(informe => (
            <ListItem
              key={informe.id}
              secondaryAction={
                <Button
                  component={RouterLink}
                  to={`/informe/${informe.id}`}
                  edge="end"
                >
                  Ver Detalles
                </Button>
              }
              divider
            >
              <ListItemText
                primary={informe.titulo}
                secondary={`Creado por: ${informe.creador.nombre} - ${new Date(informe.createdAt).toLocaleDateString()}`}
              />
            </ListItem>
          )) : (
            <Typography sx={{ mt: 3, textAlign: 'center' }}>No hay informes para mostrar.</Typography>
          )}
        </List>
      )}

      {/* --- Modal para crear informe --- */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Crear Nuevo Informe</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="titulo"
            name="titulo"
            label="Título del Informe"
            type="text"
            fullWidth
            variant="standard"
            value={newInformeData.titulo}
            onChange={handleInputChange}
            required
          />
          <TextField
            margin="dense"
            id="descripcion"
            name="descripcion"
            label="Descripción (opcional)"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="standard"
            value={newInformeData.descripcion}
            onChange={handleInputChange}
          />
          {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleCreateInforme}>Crear</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DashboardPage;