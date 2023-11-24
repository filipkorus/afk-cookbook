import 'dotenv/config';
import checkObjectValuesNotNull from '../src/utils/checkObjectValuesNotNull';

const config = {
	PORT: process.env.PORT ?? 5001,
	ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS?.split(';') ?? [],
	LOGGER: {
		LEVEL: process.env.LOG_LEVEL ?? 'debug',
		SAVE_TO_FILE: false,
		FILE: 'app.log'
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
		}
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
