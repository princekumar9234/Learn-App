import axios from "axios";

const getBaseURL = () => {
    let url = import.meta.env.VITE_API_URL;
    
    if (!url) {
        url = import.meta.env.DEV ? '/api' : 'https://learn-app-production-3cac.up.railway.app/api';
    }

    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/')) {
        url = `https://${url}`;
    }

    if (url.startsWith('http') && !url.endsWith('/api') && !url.endsWith('/api/')) {
        url = url.replace(/\/$/, '') + '/api';
    }

    return url;
};

export const API_BASE_URL = getBaseURL();

const ClientServer = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

export default ClientServer;
