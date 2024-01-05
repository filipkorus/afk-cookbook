import {Request, Response} from 'express';
import {
	BAD_REQUEST,
	CONFLICT,
	CREATED,
	MISSING_BODY_FIELDS,
	NOT_FOUND, SERVER_ERROR,
	SUCCESS
} from '../../../utils/httpCodeResponses/messages';
import {z} from 'zod';
import config from '../../../../config';
import validateObject from '../../../utils/validateObject';
import {getRecipeById} from '../recipe.service';
import {
	createReview,
	getAllReviewsByRecipeIdCount, getAverageStars,
	getReviewByRecipeIdAndUserId, getReviewsByRecipeId,
	hasUserAlreadyReviewedThisRecipe
} from './review.service';
import paginationParams from '../../../utils/pagination/paginationParams';

export const GetReviewsByRecipeIdHandler = async (req: Request, res: Response) => {
	const {recipeId} = req.params;

	if (recipeId == null || !Number.isInteger(Number(recipeId))) {
		return BAD_REQUEST(res, 'Invalid or missing \'recipeId\' param');
	}

	const ValidationSchema = z.object({
		page: z.string().regex(/^\d+$/).optional(),
		limit: z.string().regex(/^\d+$/).optional()
	});

	const validatedReqQuery = validateObject(ValidationSchema, req.query);

	if (validatedReqQuery.data?.page == null && validatedReqQuery.data?.limit == null) {
		return BAD_REQUEST(res, 'page number OR maximum of recipes for page param is required');
	}

	const {startIndex, page, limit} = paginationParams({
		page: validatedReqQuery.data.page,
		limit: validatedReqQuery.data.limit
	});

	const recipe = await getRecipeById(+recipeId);

	// check if recipe was found
	if (recipe == null) {
		return NOT_FOUND(res, `Recipe with ID of ${recipeId} not found.`);
	}

	// check if current user can view this recipe
	if (recipe.userId !== res.locals.user.id && !recipe.isPublic) {
		return NOT_FOUND(res, `Recipe with ID of ${recipeId} not found.`);
	}

	// fetch reviews, all reviews count, current user review
	const [totalReviews, reviews, currentUserReview] = await Promise.all([
		getAllReviewsByRecipeIdCount({
			recipeId: +recipeId,
			userIdToExcludeReviewFrom: res.locals.user.id
		}),
		getReviewsByRecipeId({
			recipeId: +recipeId,
			limit,
			startIndex,
			userIdToExcludeReviewFrom: res.locals.user.id
		}),
		getReviewByRecipeIdAndUserId({
			recipeId: +recipeId,
			userId: res.locals.user.id
		})
	]);
	const totalPages = Math.ceil((totalReviews ?? 0) / limit);

	const responseData = {
		page,
		limit,
		totalReviews,
		totalPages,
		currentUserReview,
		reviews
	};

	if (page > totalPages) {
		return BAD_REQUEST(res, 'No more pages', responseData);
	}

	return SUCCESS(res, 'Paginated reviews fetched successfully', responseData);
};

export const GetStarsByRecipeIdHandler = async (req: Request, res: Response) => {
	const {recipeId} = req.params;

	if (recipeId == null || !Number.isInteger(Number(recipeId))) {
		return BAD_REQUEST(res, 'Invalid or missing \'recipeId\' param');
	}

	const [recipe, stars] = await Promise.all([
		getRecipeById(+recipeId),
		getAverageStars(+recipeId)
	]);

	// check if recipe was found
	if (recipe == null) {
		return NOT_FOUND(res, `Recipe with ID of ${recipeId} not found.`);
	}

	// check if current user can view this recipe
	if (recipe.userId !== res.locals.user.id && !recipe.isPublic) {
		return NOT_FOUND(res, `Recipe with ID of ${recipeId} not found.`);
	}

	return SUCCESS(res, 'Stars fetched successfully', {stars});
};

export const CreateReviewHandler = async (req: Request, res: Response) => {
	const {recipeId} = req.params;

	if (recipeId == null || !Number.isInteger(Number(recipeId))) {
		return BAD_REQUEST(res, 'Invalid or missing \'recipeId\' param');
	}

	// check if body fields are presented
	const ValidationSchema = z.object({
		stars: z
			.number({required_error: 'number of stars is required'})
			.min(config.APP.RECIPE_REVIEW.STARS.MIN, `minimum number of stars is ${config.APP.RECIPE_REVIEW.STARS.MIN}`)
			.max(config.APP.RECIPE_REVIEW.STARS.MAX, `maximum number of stars is ${config.APP.RECIPE_REVIEW.STARS.MAX}`),
		comment: z
			.string()
			.trim()
			.max(config.APP.RECIPE_REVIEW.COMMENT.LENGTH.MAX, `comment must be shorter than ${config.APP.RECIPE_REVIEW.COMMENT.LENGTH.MAX} characters`)
			.optional()
			.default('')
	});

	const validatedReqBody = validateObject(ValidationSchema, req.body);

	if (validatedReqBody.data == null) {
		return MISSING_BODY_FIELDS(res, validatedReqBody.errors);
	}

	// check if recipe with recipeId exists and is available
	const recipe = await getRecipeById(+recipeId);
	if (recipe == null || (recipe.userId != res.locals.user.id && !recipe.isPublic)) {
		return NOT_FOUND(res, `Recipe with ID = ${recipeId} does not exists`);
	}

	if (recipe.userId === res.locals.user.id) {
		return CONFLICT(res, `You cannot review your own recipe`);
	}

	// check if this user not added a review before
	if (await hasUserAlreadyReviewedThisRecipe({userId: res.locals.user.id, recipeId: +recipeId})) {
		return CONFLICT(res, 'You have already reviewed this recipe');
	}

	// add review
	const review = await createReview({
		...validatedReqBody.data,
		userId: res.locals.user.id,
		recipeId: +recipeId
	});

	if (review === null) {
		return SERVER_ERROR(res, 'Something went wrong! Review has not been added');
	}

	return CREATED(res, 'Review created successfully', {review});
};