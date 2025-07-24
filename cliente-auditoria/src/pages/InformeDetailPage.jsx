import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { api, downloadFile } from '../api/apiService';
import { Container, Typography, Box, CircularProgress, List, ListItem, ListItemText, Button, Divider, TextField } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';

const InformeDetailPage = () => {
  const { id } = useParams();
  const [informe, setInforme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [comentarios, setComentarios] = useState('');
  const [uploading, setUploading] = useState(false);

  const fetchInforme = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/informes/${id}`);
      setInforme(response.data);
    } catch (error) {
      console.error("Error al cargar el informe:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchInforme();
  }, [fetchInforme]);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Por favor, selecciona un archivo.');
      return;
    }
    
    const formData = new FormData();
    formData.append('documento', selectedFile);
    formData.append('comentarios', comentarios);

    try {
      setUploading(true);
      await api.post(`/informes/${id}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Versión subida con éxito!');
      // Resetear formulario y recargar datos
      setSelectedFile(null);
      setComentarios('');
      document.getElementById('file-input').value = null; 
      fetchInforme();
    } catch (error) {
      console.error("Error al subir la versión:", error);
      alert('Error al subir la versión.');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = (versionId, filename) => {
    downloadFile(`/informes/version/${versionId}/download`, filename);
  };

  if (loading) return <Container sx={{textAlign: 'center', mt: 5}}><CircularProgress /></Container>;
  if (!informe) return <Container><Typography>Informe no encontrado.</Typography></Container>;

  return (
    <Container>
      <Button component={RouterLink} to="/dashboard" sx={{ my: 2 }}>
        ← Volver al Panel
      </Button>
      <Typography variant="h4" gutterBottom>{informe.titulo}</Typography>
      <Typography variant="body1" color="text.secondary">{informe.descripcion}</Typography>
      <Divider sx={{ my: 2 }} />

      {/* Formulario de subida */}
      <Box component="form" onSubmit={handleUpload} sx={{ my: 4, p: 2, border: '1px dashed grey', borderRadius: 1 }}>
          <Typography variant="h6">Subir Nueva Versión</Typography>
          <TextField 
            type="file" 
            id="file-input"
            onChange={handleFileChange} 
            fullWidth
            margin="normal"
            inputProps={{ accept: ".docx" }}
          />
          <TextField 
            label="Comentarios de la versión (opcional)"
            value={comentarios}
            onChange={(e) => setComentarios(e.target.value)}
            fullWidth
            multiline
            rows={2}
            margin="normal"
          />
          <Button 
            type="submit" 
            variant="contained" 
            startIcon={<UploadFileIcon />}
            disabled={!selectedFile || uploading}
          >
            {uploading ? 'Subiendo...' : 'Subir Archivo'}
          </Button>
      </Box>
      
      <Divider sx={{ my: 2 }} />

      {/* Lista de versiones */}
      <Typography variant="h5" gutterBottom>Historial de Versiones</Typography>
      <List>
        {informe.Versions && informe.Versions.length > 0 ? informe.Versions.map(version => (
          <ListItem 
            key={version.id}
            secondaryAction={
              <Button 
                startIcon={<DownloadIcon />} 
                onClick={() => handleDownload(version.id, version.nombreArchivo)}
              >
                Descargar
              </Button>
            }
          >
            <ListItemText
              primary={`Versión ${version.numeroVersion} - ${version.nombreArchivo}`}
              secondary={`Subido por ${version.autorVersion.nombre} el ${new Date(version.createdAt).toLocaleString()} - Comentarios: "${version.comentarios || 'N/A'}"`}
            />
          </ListItem>
        )) : (
          <Typography>Aún no se han subido versiones para este informe.</Typography>
        )}
      </List>
    </Container>
  );
};

export default InformeDetailPage;