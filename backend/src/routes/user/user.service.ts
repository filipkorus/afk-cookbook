import {PrismaClient, User} from "@prisma/client";
import logger from '../../utils/logger';

const prisma = new PrismaClient();

/**
 * Checks if email already exists.
 *
 * @returns {Promise<boolean>} Promise<Boolean> which indicates if email is already used.
 * @param email {string} Email to be checked.
 */
export const emailExists = async (email: string): Promise<boolean> => {
	try {
		return await prisma.user.count({where: {email}}) > 0;
	} catch (error) {
		logger.error(error);
		return true;
	}
}

/**
 * Save user data in the database.
 *
 * @returns {Promise<User|null>} User object from database or null if error.
 */
export const createUser = async ({name, picture, email}: {
	name: string,
	picture: string,
	email: string
}): Promise<User | null> => {
	let user = null;
	try {
		user = await prisma.user.create({
			data: {
				name,
				picture,
				email
			}
		});
		if (user == null) return null;
	} catch (error) {
		logger.error(error);
		return null;
	}

	return user;
};

/**
 * Returns user object with given user ID.
 *
 * @returns {Promise<User|null>|null} User object or null if error.
 * @param userId {number} User's ID.
 */
export const getUserById = (userId: number): Promise<User | null> | null => {
	try {
		return prisma.user.findFirst({where: {id: userId}});
	} catch (error) {
		logger.error(error);
		return null;
	}
};

/**
 * Returns user object by given username/email.
 *
 * @returns {Promise<User|null>} User object or null if error.
 * @param email {string} Email of user to be found.
 */
export const getUserByEmail = async (email: string): Promise<User | null> => {
	try {
		return await prisma.user.findFirst({
			where: {email}
		});
	} catch (error) {
		logger.error(error);
		return null;
	}
};

/**
 *
 * @param newName {string} Name to be updated.
 * @param newPicture {string} User's picture.
 * @param email {string} User's email.
 * @returns Boolean indicating success or not.
 */
export const updateNameAndPicture = async (newName: string, newPicture: string, email: string): Promise<boolean> => {
	try {
		await prisma.user.update({
			where: {email},
			data: {
				name: newName,
				picture: newPicture
			}
		});
		return true;
	} catch (error) {
		logger.error(error);
		return false;
	}
};
