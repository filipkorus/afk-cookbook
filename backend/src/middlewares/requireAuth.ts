import {NextFunction, Response, Request} from 'express';
import {UNAUTHORIZED} from '../utils/httpCodeResponses/messages';

const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
	if (res.locals.authenticated) {
		return next();
	}

	return UNAUTHORIZED(res);
};

export default requireAuth;
