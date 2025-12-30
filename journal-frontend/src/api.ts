import { authClient } from './neon';

const API_URL = import.meta.env.VITE_API_URL;

export const api = {
    request: async (endpoint: string, options: RequestInit = {}) => {
        const { data } = await authClient.getSession();
        const token = data?.session?.token;

        if (!token) {
            throw new Error('No active session');
        }

        const headers = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            ...options.headers,
        };

        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) throw new Error('API Request Failed');
        return response.json();
    },

    getEntries: () => api.request('/entries'),

    createEntry: (content: string) =>
        api.request('/entries', {
            method: 'POST',
            body: JSON.stringify({ content }),
        }),
};