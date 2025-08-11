import { auth } from '../firebase';

const API_BASE = process.env.REACT_APP_API_BASE;

export const apiCall = async (endpoint, options = {}) => {
    try {
        const user = auth.currentUser;
        
        const defaultHeaders = {
            'Content-Type': 'application/json'
        };

        // Add authentication header only if user is logged in
        if (user) {
            const token = await user.getIdToken();
            defaultHeaders['Authorization'] = `Bearer ${token}`;
        }

        const requestOptions = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers
            }
        };

        const response = await fetch(`${API_BASE}${endpoint}`, requestOptions);
        
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Authentication failed');
            } else if (response.status === 429) {
                throw new Error('Rate limit exceeded. Please try again later.');
            } else if (response.status >= 500) {
                throw new Error('Server error. Please try again later.');
            } else {
                throw new Error(`Request failed: ${response.status}`);
            }
        }

        return response;
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
};

export const apiGet = async (endpoint) => {
    const response = await apiCall(endpoint, { method: 'GET' });
    return response;
};

export const apiPost = async (endpoint, data) => {
    const response = await apiCall(endpoint, {
        method: 'POST',
        body: JSON.stringify(data)
    });
    return response;
};

export const apiDelete = async (endpoint) => {
    const response = await apiCall(endpoint, { method: 'DELETE' });
    return response;
};