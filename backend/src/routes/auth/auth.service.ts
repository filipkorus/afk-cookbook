import {PrismaClient, RefreshToken} from "@prisma/client";
import {OAuth2Client, TokenPayload} from 'google-auth-library';
import {JwtPayload, sign, verify} from 'jsonwebtoken';
import config from '../../../config';
import logger from '../../utils/logger';

const prisma = new PrismaClient();

const client = new OAuth2Client(config.OAUTH.GOOGLE_CLIENT_ID);

/**
 * Generated JWT refresh token, saves it to the database and returns it.
 *
 * @returns {Promise<string>} JWT refresh token.
 * @param userId {number} User's ID.
 */
export const generateRefreshToken = async (userId: number): Promise<string> => {
	const refreshToken = sign({
			id: userId
		},
		config.JWT.REFRESH_TOKEN.SECRET,
		{expiresIn: `${config.JWT.REFRESH_TOKEN.EXPIRES_IN_DAYS}d`}
	);

	// save refresh token to DB
	const expiresAt = new Date();
	expiresAt.setDate(expiresAt.getDate() + config.JWT.REFRESH_TOKEN.EXPIRES_IN_DAYS); // add X days to current time
	try {
		await prisma.refreshToken.create({
			data: {
				userId: userId,
				token: refreshToken,
				expiresAt
			}
		});
	} catch (error) {
		logger.error(error);
	}

	return refreshToken;
};

/**
 * Returns boolean indicating if refresh token is valid.
 *
 * @returns Boolean indicating token validity.
 * @param refreshToken Refresh token to be checked.
 * @param userId ID of the refresh token's owner.
 */
export const isRefreshTokenValid = async (refreshToken: string, userId: number): Promise<boolean> => {
	try {
		return (await prisma.refreshToken.findFirst({
			where: {
				token: refreshToken,
				userId,
				expiresAt: {gte: new Date()}
			}
		})) != null;
	} catch (error) {
		logger.error(error);
		return false;
	}
};

/**
 * Returns refresh token object from the database.
 *
 * @returns {Promise<RefreshToken|null>} RefreshTokenHandler token record or null if error.
 * @param userId {number} User's ID.
 */
export const getRefreshToken = async (userId: number): Promise<RefreshToken | null> => {
	try {
		return await prisma.refreshToken.findFirst({
			where: {
				userId,
				expiresAt: {gte: new Date()}
			}
		});
	} catch (error) {
		logger.error(error);
		return null;
	}
};

/**
 * Deletes refresh token from the database.
 *
 * @param refreshToken {string} JWT refresh token.
 */
export const deleteRefreshToken = async (refreshToken: string) => {
	try {
		await prisma.refreshToken.delete({where: {token: refreshToken}});
	} catch (error) {
		logger.error(error);
	}
}

/**
 * Deletes all expired refresh tokens from the database.
 */
export const deleteExpiredRefreshTokens = async () => {
	try {
		await prisma.refreshToken.deleteMany({
			where: {expiresAt: {lt: new Date()}}
		});
	} catch (error) {
		logger.error(error);
	}
};

/**
 * Verifies JWT refresh token.
 *
 * @returns {string | JwtPayload | null} JWT payload.
 * @param refreshToken {string} JWT refresh token.
 */
export const verifyRefreshToken = (refreshToken: string): string | JwtPayload | null => {
	try {
		return verify(refreshToken, config.JWT.REFRESH_TOKEN.SECRET);
	} catch (error) {
		logger.error(error);
		return null;
	}
};

/**
 * Generated JWT access token.
 *
 * @returns {string} JWT access token.
 * @param userId {number} User's ID.
 */
export const generateAccessToken = (userId: number): string => {
	return sign(
		{id: userId},
		config.JWT.ACCESS_TOKEN.SECRET,
		{expiresIn: config.JWT.ACCESS_TOKEN.EXPIRES_IN}
	);
};

/**
 * Verifies JWT access token.
 *
 * @returns {string | JwtPayload | null} JWT payload.
 * @param accessToken {string} JWT access token.
 */
export const verifyAccessToken = (accessToken: string): string | JwtPayload | null => {
	try {
		return verify(accessToken, config.JWT.ACCESS_TOKEN.SECRET);
	} catch (error) {
		logger.error(error);
		return null;
	}
};

/**
 *
 * @param oAuthToken {string} Google OAuth token.
 * @returns TokenPayload or null if error.
 */
export const verifyGoogleToken = async (oAuthToken: string): Promise<TokenPayload | undefined | null> => {
	try {
		const ticket = await client.verifyIdToken({
			idToken: oAuthToken,
			audience: config.OAUTH.GOOGLE_CLIENT_ID,
		});
		return ticket.getPayload();
	} catch (error) {
		logger.error(error)
		return null;
	}
}
