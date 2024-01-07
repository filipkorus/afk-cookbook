import api from '@/api';

export const login = (credential: string) => api.post('/auth/login', {credential}, {withCredentials: true});

export const logout = () => api.get('/auth/logout', {withCredentials: true});

export const refreshToken = () => api.post('/auth/refresh', {}, {withCredentials: true});
