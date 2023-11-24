import api from '@/api/index.ts';

export const getCurrentlyLoggedUser = () => api.get('/user');
