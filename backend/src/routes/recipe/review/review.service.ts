import logger from '../../../utils/logger';
import {PrismaClient, RecipeReview} from '@prisma/client';

const prisma = new PrismaClient();

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
 * @returns { Promise<RecipeReview | null>} RecipeReview object or null if error.
 */
export const createReview = async ({stars, comment = '', userId, recipeId}: {
	stars: number,
	comment?: string,
	userId: number,
	recipeId: number
}): Promise<RecipeReview | null> => {
	try {
		return prisma.recipeReview.create({
			data: {
				stars: Math.round(stars),
				comment,
				recipeId,
				userId
			},
			select: {
				author: {
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
	} catch (error) {
		logger.error(error);
		return null;
	}
};

/**
 * Save recipe's updated review in the database.
 *
 * @param stars {number} Number of stars.
 * @param comment {string} Review's text. Optional - empty string is the default value.
 * @param reviewId {number} Review's ID.
 * @returns { Promise<RecipeReview | null>} RecipeReview object or null if error.
 */
export const updateReview = async ({stars, comment = '', reviewId}: {
	stars: number,
	comment?: string,
	reviewId: number
}): Promise<RecipeReview | null> => {
	try {
		return prisma.recipeReview.update({
			where: {id:reviewId},
			data: {
				stars: Math.round(stars),
				comment
			},
			select: {
				author: {
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
	} catch (error) {
		logger.error(error);
		return null;
	}
};

/**
 * Removes review from the database.
 *
 * @param reviewId {number} Review's ID.
 * @returns { Promise<RecipeReview | null>} RecipeReview object or null if error.
 */
export const deleteReview = async (reviewId: number): Promise<RecipeReview | null> => {
	try {
		return prisma.recipeReview.delete({where: {id:reviewId}});
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
 * @returns {Promise<Array<RecipeReview> | null> | null} Array of FullRecipeReviewObject or null if error.
 */
export const getReviewsByRecipeId = ({startIndex, limit, recipeId, userIdToExcludeReviewFrom}: {
	startIndex?: number;
	limit?: number;
	recipeId: number;
	userIdToExcludeReviewFrom?: number;
}): Promise<Array<RecipeReview> | null> | null => {
	try {
		return prisma.recipeReview.findMany({
			where: {recipeId, NOT: {userId: userIdToExcludeReviewFrom}},
			orderBy: {createdAt: 'desc'},
			skip: startIndex,
			take: limit,
			select: {
				author: {
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
 * @returns {Promise<RecipeReview | null> | null} RecipeReview object with author or null if review of given user was not found or error occurred.
 */
export const getReviewByRecipeIdAndUserId = ({userId, recipeId}: {
	userId: number;
	recipeId: number;
}): Promise<RecipeReview | null> | null => {
	try {
		return prisma.recipeReview.findFirst({
			where: {userId, recipeId},
			select: {
				author: {
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
	} catch (error) {
		logger.error(error);
		return null;
	}
};

/**
 * Returns review with given ID.
 *
 * @param reviewId {number} Review's ID/
 * @returns {Promise<RecipeReview | null> | null} RecipeReview object or null if error occurred.
 */
export const getReviewByReviewId = (reviewId: number): Promise<RecipeReview | null> | null => {
	try {
		return prisma.recipeReview.findUnique({where: {id: reviewId}});
	} catch (error) {
		logger.error(error);
		return null;
	}
};

/**
 * Returns number of reviews for given recipe in the database.
 *
 * @param recipeId {number} Recipe's ID.
 * @param userIdToExcludeReviewFrom {number} User's ID whose reviews you want to exclude from result.
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
