const env = import.meta.env;
const production = env.PROD;
const domain = window.location.origin;

const getApiUrl = (): string => {
	if (production) return `${domain}/api/`;

	if (!production && domain === 'http://localhost:3001') return 'http://localhost:9000/';

	// backend API -> 'http://localhost:9000/'
	// backend API from docker container -> 'http://localhost:7777/api/'

	return 'http://localhost:9000/';
};

const CONFIG = {
	PRODUCTION: production,
	DOMAIN: domain,
	API_URL: getApiUrl(),
	OAUTH_GOOGLE_CLIENT_ID: '325396365340-a0ufpksrnsmigrpko21ah2to0n3p6uv9.apps.googleusercontent.com'
} as const;

export default CONFIG;
