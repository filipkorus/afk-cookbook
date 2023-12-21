import {NextFunction, Response, Request} from 'express';
import {getUserById} from '../routes/user/user.service';
import {verifyAccessToken} from '../routes/auth/auth.service';
import config from '../../config';

const authenticate = async (req: Request, res: Response, next: NextFunction) => {
	const accessToken = req.header('Authorization')?.split(' ')[1];

	if (!config.PRODUCTION && accessToken === config.TEST.ACCESS_TOKEN) {
		res.locals.authenticated = true;
		res.locals.user = await getUserById(config.TEST.USER_ID);
		return next();
	}

	if (accessToken == null) {
		return next();
	}

	const payload = verifyAccessToken(accessToken);
	if (payload == null) {
		return next();
	}

	if (!(typeof payload === 'object' && 'id' in payload && typeof payload.id === 'number')) {
		return next();
	}

	const user = await getUserById(payload.id);
	if (user == null) {
		return next();
	}

	res.locals.authenticated = true;
	res.locals.user = user;
	next();
};

export default authenticate;
