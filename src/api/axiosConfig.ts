import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    withCredentials: true,
})

api.interceptors.response.use(
    (response) => response, 
    (error) => {
        if (error.response && error.response.status === 401) {
            console.warn("Sesión expirada, redirigiendo...");
            localStorage.removeItem('user');
            window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);
export default api