import api from '@/api';

export const getCurrentlyLoggedUser = () => api.get('/user');
