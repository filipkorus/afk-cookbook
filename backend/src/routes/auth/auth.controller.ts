import {
	deleteExpiredRefreshTokens, deleteRefreshToken,
	generateAccessToken,
	generateRefreshToken, isRefreshTokenValid,
	verifyGoogleToken,
	verifyRefreshToken
} from './auth.service';
import {
	ACCOUNT_BANNED,
	ACCOUNT_CREATED,
	BAD_REQUEST,
	INVALID_LOGIN_CREDENTIALS, MISSING_BODY_FIELDS, SERVER_ERROR,
	SUCCESS, UNAUTHORIZED
} from '../../utils/httpCodeResponses/messages';
import {createUser, emailExists, getUserByEmail, updateNameAndPicture} from '../user/user.service';
import config from '../../../config';
import {Request, Response} from 'express';
import {z} from 'zod';
import validateObject from '../../utils/validateObject';

export const LoginHandler = async (req: Request, res: Response) => {
	await deleteExpiredRefreshTokens();

	const RequestSchema = z.object({
		credential: z.string({required_error: 'credential field does not exist'})
	});

	const validatedRequest = validateObject(RequestSchema, req.body);

	if (validatedRequest.data == null) {
		return MISSING_BODY_FIELDS(res, validatedRequest.errors);
	}

	const profile = await verifyGoogleToken(validatedRequest.data.credential);
	if (profile == null) {
		return INVALID_LOGIN_CREDENTIALS(res);
	}

	if (!(typeof profile === 'object' &&
		'email' in profile && typeof profile.email === 'string' &&
		'name' in profile && typeof profile.name === 'string' &&
		'picture' in profile && typeof profile.picture === 'string'
	)) {
		return SERVER_ERROR(res, 'Google Authentication failed');
	}

	let firstLogin = false;
	// user not found in DB
	if (!(await emailExists(profile.email))) {
		firstLogin = true;

		if (!(await createUser({
			email: profile.email,
			name: profile?.name,
			picture: profile?.picture
		}))) {
			return BAD_REQUEST(res, 'Something went wrong! Account has not been created');
		}
	}

	const [user, _] = await Promise.all([
		getUserByEmail(profile.email),
		updateNameAndPicture(profile?.name, profile?.picture, profile.email) // update name in db if changed
	]);

	if (user == null) {
		return UNAUTHORIZED(res);
	}

	if (user.banned) {
		return ACCOUNT_BANNED(res);
	}

	const refreshToken = await generateRefreshToken(user.id);
	const expiresAt = new Date();
	expiresAt.setDate(expiresAt.getDate() + config.JWT.REFRESH_TOKEN.EXPIRES_IN_DAYS); // add X days to current time

	res.cookie('refreshToken', refreshToken, {
		httpOnly: true,
		maxAge: expiresAt.getTime(),
		sameSite: 'strict'
	});

	const accessToken = generateAccessToken(user.id);

	const data = {
		token: accessToken,
		user
	};

	return firstLogin ?
		ACCOUNT_CREATED(res, data) :
		SUCCESS(res, 'User logged successfully', data);
};

export const RefreshTokenHandler = async (req: Request, res: Response) => {
	const refreshToken = req.cookies['refreshToken'];
	if (refreshToken == null) {
		return UNAUTHORIZED(res);
	}

	const payload = verifyRefreshToken(refreshToken);
	if (
		payload == null ||
		!(typeof payload === 'object' && 'id' in payload && typeof payload.id === 'number')
	) {
		return UNAUTHORIZED(res);
	}

	if (!(await isRefreshTokenValid(refreshToken, payload.id))) {
		return UNAUTHORIZED(res);
	}

	const newAccessToken = generateAccessToken(payload.id);

	return SUCCESS(res, 'Access token has been refreshed', {token: newAccessToken});
};

export const LogoutHandler = async (req: Request, res: Response) => {
	const refreshToken = req.cookies['refreshToken'];

	await deleteRefreshToken(refreshToken); // delete refresh token from DB
	res.cookie('refreshToken', '', {maxAge: 0}); // delete http-only cookie refresh token

	return SUCCESS(res, 'Logged out successfully');
};
