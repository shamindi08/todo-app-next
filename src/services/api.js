import axios from 'axios';

const API_URL = "http://localhost:5000/api/";

const token = typeof window !== "undefined" ? localStorage.getItem('token') : null;

const api = axios.create({
    baseURL: API_URL,
    
});


const getToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('token');
    }
    return null;
};


api.interceptors.request.use((config) => {
    const newToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (newToken) {
        config.headers.Authorization = `Bearer ${newToken}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});


api.interceptors.response.use((response) => {
    return response;
}, (error) => {
    if (error.response) {
        
        if (error.response.status === 401) {
           
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                window.location.href = '/';
            }
        }
       
        throw new Error(error.response.data.message || 'Something went wrong');
    } else {
        
        throw new Error(error.message || 'Something went wrong');
    }
});

export default {
    get: (endpoint) => api.get(endpoint),
    post: (endpoint, data) => api.post(endpoint, data),
    put: (endpoint, data) => api.put(endpoint, data),
    patch: (endpoint, data) => api.patch(endpoint, data),
    delete: (endpoint) => api.delete(endpoint),
};