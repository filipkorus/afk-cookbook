import axios from 'axios';
import CONFIG from '@/config';
import {refreshToken} from '@/api/auth.ts';

const api = axios.create({
	baseURL: CONFIG.API_URL
});

let refresh = false;

api.interceptors.response.use(res => res, async error => {
	if (error.response.status !== 401 || refresh) {
		refresh = false;
		return Promise.reject(error);
	}

	refresh = true;

	try {
		const {data, status} = await refreshToken();

		if (status === 200) {
			api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
			error.response.config.headers['Authorization'] = `Bearer ${data.token}`;

			return api(error.response.config);
		}
	} catch (error2) {
		return Promise.reject(error2);
	}
});

export default api;
