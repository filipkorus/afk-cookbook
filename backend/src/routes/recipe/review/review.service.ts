import logger from '../../../utils/logger';
import {PrismaClient, RecipeReview, User} from '@prisma/client';

const prisma = new PrismaClient();

type FullRecipeReviewObject = RecipeReview & {
	author?: Omit<User, 'email' | 'banned'>
};

/**
 * Returns boolean indicating whether user with userId has already submitted review for recipe with recipeId.
 *
 * @param userId {number} User's ID.
 * @param recipeId {number} Recipe's ID.
 * @returns Promise<boolean | null>
 */
export const hasUserAlreadyReviewedThisRecipe = async ({userId, recipeId}: {
	userId: number,
	recipeId: number
}) => {
	try {
		return (await prisma.recipeReview.count({
			where: {
				userId,
				recipeId
			}
		})) > 0;
	} catch (error) {
		logger.error(error);
		return null;
	}
};

/**
 * Save recipe's review in the database.
 *
 * @param stars {number} Number of stars.
 * @param comment {string} Review's text. Optional - empty string is the default value.
 * @param userId {number} User's ID.
 * @param recipeId {number} Recipe's ID.
 * @returns {Promise<FullRecipeReviewObject | null> | null} FullRecipeReviewObject or null if error.
 */
export const createReview = async ({stars, comment = '', userId, recipeId}: {
	stars: number,
	comment?: string,
	userId: number,
	recipeId: number
}): Promise<FullRecipeReviewObject | null> => {
	try {
		const review = await prisma.recipeReview.create({
			data: {
				stars,
				comment,
				recipeId,
				userId
			},
			select: {
				user: {
					select: {id: true, name: true, picture: true, admin: true, joinedAt: true}
				},
				id: true,
				stars: true,
				comment: true,
				recipeId: true,
				userId: true,
				createdAt: true
			}
		});

		const {user, ...rest} = review;
		return {
			...rest,
			author: user
		};
	} catch (error) {
		logger.error(error);
		return null;
	}
};

/**
 * Returns average (and quantity) of all star reviews of given recipe.
 *
 * @param recipeId {number} Recipe's ID.
 * @returns {Promise<number | null>} Average of all star reviews or null if error.
 */
export const getAverageStars = async (recipeId: number): Promise<{ average: number; count: number } | null> => {
	try {
		const records = await prisma.recipeReview.findMany({
			where: {recipeId},
			select: {stars: true}
		});

		if (records == null || records.length === 0) {
			return {
				count: 0,
				average: 0
			};
		}

		const totalStars = records.reduce((acc, record) => acc + record.stars, 0);

		return {
			count: records.length,
			average: Number((totalStars / records.length).toFixed(1)) // average stars rounded to 1 decimal
		};
	} catch (error) {
		logger.error(error);
		return null;
	}
};

/**
 * Returns array of FullRecipeReviewObject.
 *
 * @param startIndex {number} Pagination parameter.
 * @param limit {number} Pagination parameter.
 * @param recipeId {number} Recipe's ID.
 * @param userIdToExcludeReviewFrom {number} User's ID whose review you want not to include.
 * @returns {Promise<Array<FullRecipeReviewObject> | null>} Array of FullRecipeReviewObject or null if error.
 */
export const getReviewsByRecipeId = async ({startIndex, limit, recipeId, userIdToExcludeReviewFrom}: {
	startIndex?: number;
	limit?: number;
	recipeId: number;
	userIdToExcludeReviewFrom?: number;
}): Promise<Array<FullRecipeReviewObject> | null> => {
	try {
		const reviews = await prisma.recipeReview.findMany({
			where: {recipeId, NOT: {userId: userIdToExcludeReviewFrom}},
			orderBy: {createdAt: 'desc'},
			skip: startIndex,
			take: limit,
			select: {
				user: {
					select: {id: true, name: true, picture: true, admin: true, joinedAt: true}
				},
				id: true,
				stars: true,
				comment: true,
				recipeId: true,
				userId: true,
				createdAt: true
			}
		});

		return reviews.map(({user, ...review}) => {
			return {
				...review,
				author: user
			};
		});
	} catch (error) {
		logger.error(error);
		return null;
	}
};

/**
 * Returns review of recipe with given ID created by user with given ID.
 *
 * @param userId {number} User's ID.
 * @param recipeId {number} Recipe's ID.
 * @returns {Promise<FullRecipeReviewObject | null>} FullRecipeReviewObject or null if review of given user was not found or error occurred.
 */
export const getReviewByRecipeIdAndUserId = async ({userId, recipeId}: {
	userId: number;
	recipeId: number;
}): Promise<FullRecipeReviewObject | null> => {
	try {
		const review= await prisma.recipeReview.findFirst({
			where: {userId, recipeId},
			select: {
				user: {
					select: {id: true, name: true, picture: true, admin: true, joinedAt: true}
				},
				id: true,
				stars: true,
				comment: true,
				recipeId: true,
				userId: true,
				createdAt: true
			}
		});

		if (review == null) {
			return null;
		}

		const {user, ...rest} = review;

		return {
			...rest,
			author: user
		};
	} catch (error) {
		logger.error(error);
		return null;
	}
};

/**
 * Returns number of reviews for given recipe in the database.
 *
 * @param recipeId {number} Recipe's ID.
 * @returns {Promise<number> | null} Number of reviews for given recipe in the database.
 */
export const getAllReviewsByRecipeIdCount = ({recipeId, userIdToExcludeReviewFrom}: {
	recipeId: number;
	userIdToExcludeReviewFrom?: number;
}): Promise<number> | null => {
	try {
		return prisma.recipeReview.count({where: {recipeId, NOT: {userId: userIdToExcludeReviewFrom}}});
	} catch (error) {
		logger.error(error);
		return null;
	}
};