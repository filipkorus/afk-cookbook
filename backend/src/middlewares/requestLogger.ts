import {NextFunction, Response, Request} from 'express';
import logger from '../utils/logger';
import colors from '../utils/colors';

/**
 * HTTP request logger - express middleware.
 */
const requestLogger = (req: Request, res: Response, next: NextFunction) => {
	const ip = req.header('CF-Connecting-IP') ??
		req.header('x-forwarded-for') ??
		req.ip;

	const authenticated = res.locals.authenticated ?
		`${colors.green}A${colors.reset}` :
		`${colors.red}U${colors.reset}`;

	logger.info(`[${ip} ${authenticated}] ${req.method} ${req.originalUrl}`);

	next();
};

export default requestLogger;
