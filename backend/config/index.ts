import 'dotenv/config';
import checkObjectValuesNotNull from '../src/utils/checkObjectValuesNotNull';

const config = {
	PRODUCTION: process.env.PRODUCTION === 'true' ?? true,
	PORT: process.env.PORT ?? 5001,
	ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS?.split(';') ?? [],
	LOGGER: {
		LEVEL: process.env.LOG_LEVEL ?? 'debug',
		SAVE_TO_FILE: false,
		FILE: 'app.log'
	},
	APP: {
		PAGINATION: {
			DEFAULT_PAGE_MIN: 1,
			DEFAULT_LIMIT_MAX: 3,
			MAX_LIMIT_MAX: 25
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
			STARS: {MIN: 1, MAX: 5},
			COMMENT: {LENGTH: {MAX: 1000}}
		}
	},
	OAUTH: {
		GOOGLE_CLIENT_ID: process.env.OAUTH_GOOGLE_CLIENT_ID,
	},
	DATABASE_URL: process.env.DATABASE_URL,
	JWT: {
		ACCESS_TOKEN: {
			SECRET: 'qnj23_nej823y_h28427vf234k94_k2d4',
			EXPIRES_IN: '10m'
		},
		REFRESH_TOKEN: {
			SECRET: 'fsd731b_2n3tsdds83_2jsdkmvtqgeyqg',
			EXPIRES_IN_DAYS: 7
		},
	},
	TEST: {
		USER_ID: 1,
		ACCESS_TOKEN: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
	}
} as const;

const checkConfigFields = (): Promise<string> => {
	const nullConfigFieldPath = checkObjectValuesNotNull(config);

	if (typeof nullConfigFieldPath === 'string') {
		return Promise.reject(`config field (config.${nullConfigFieldPath}) is null or undefined`);
	}

	return Promise.resolve('checking config values: OK');
}

export {checkConfigFields};

export default config;
