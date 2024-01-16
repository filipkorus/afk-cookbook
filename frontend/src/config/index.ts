const env = import.meta.env;
const production = env.PROD;
const domain = window.location.origin;

const getApiUrl = (): string => {
	if (production) return `${domain}/api/`;

	if (!production && domain === 'http://localhost:5173') return 'http://localhost:9000/';

	// backend API -> 'http://localhost:9000/'
	// backend API from docker container -> 'http://localhost:7777/api/'

	return 'http://localhost:9000/';
};

const CONFIG = {
	PRODUCTION: production,
	DOMAIN: domain,
	API_URL: getApiUrl(),
	OAUTH_GOOGLE_CLIENT_ID: '325396365340-a0ufpksrnsmigrpko21ah2to0n3p6uv9.apps.googleusercontent.com',
	APP: {
		PAGINATION: {
			RECIPES_PER_PAGE: 5,
			COMMENTS_PER_PAGE: 3,
			STARTING_PAGE_NUMBER: 1
		},
		RECIPE: {
			TITLE: {LENGTH: {MIN: 5, MAX: 255}},
			COOKING_TIME_MINUTES: {MIN:1, MAX:100_000},
			DESCRIPTION: {LENGTH: {MIN: 10}},
			LOCATION: {LENGTH: {MAX: 255}},
			LATITUDE: {MIN: -90, MAX: 90},
			LONGITUDE: {MIN: -180, MAX: 180},
			INGREDIENT: {LENGTH: {MIN: 2, MAX: 100}, QUANTITY: {MIN: 1, MAX: 25}},
			CATEGORY: {LENGTH: {MIN: 2, MAX: 100}, QUANTITY: {MIN: 1, MAX: 5}}
		},
		RECIPE_REVIEW: {
			STARS: {MIN: 1, MAX: 5, DEFAULT: 0},
			COMMENT: {LENGTH: {MAX: 1000}}
		}
	}
} as const;
export default CONFIG;
