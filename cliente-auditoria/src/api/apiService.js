import axios from 'axios';

// La URL base de tu backend.
// ¡IMPORTANTE! Asegúrate de que tu servidor de Node.js (backend) esté corriendo.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
export const api = axios.create({
  baseURL: API_URL,
});


// Añadimos de nuevo el interceptor para el token, por si acaso se recarga la página.
const token = localStorage.getItem('token');
if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Función para descargar archivos
export const downloadFile = async (url, filename) => {
    try {
        const response = await api.get(url, {
            responseType: 'blob', // Importante para manejar la respuesta como un archivo
        });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(new Blob([response.data]));
        link.setAttribute('download', filename); // El nombre que tendrá el archivo descargado
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
    } catch (error) {
        console.error("Error en la descarga:", error);
        // Aquí podrías manejar el error, por ejemplo, mostrando una notificación.
        alert('Error al descargar el archivo.');
    }
};