import {Request, Response} from 'express';
import {
	BAD_REQUEST,
	CREATED,
	MISSING_BODY_FIELDS,
	NOT_FOUND,
	SERVER_ERROR,
	SUCCESS, VALIDATION_ERROR
} from '../../utils/httpCodeResponses/messages';
import {z} from 'zod';
import validateObject from '../../utils/validateObject';
import {createRecipe, getRecipesCount, getRecipeFullObjectById, getRecipesAllWithAuthors} from './recipe.service';

export const CreateRecipeHandler = async (req: Request, res: Response) => {
	const ValidationSchema = z.object({
		title: z
			.string({required_error: 'title is required'})
			.trim()
			.max(255, 'title must be shorter than 255 characters'),
		cookingTimeMinutes: z
			.number({required_error: 'cooking time is required'})
			.min(1, 'cooking time must be positive'),
		description: z.string({required_error: 'description is required'}).trim(),
		isPublic: z.boolean().default(false),
		location: z.string().trim().max(255).or(z.null()).default(null), // could be null
		latitude: z.number().min(-90).max(90).or(z.null()).default(null), // could be null
		longitude: z.number().min(-180).max(180).or(z.null()).default(null), // could be null
		ingredients: z.array(
			z.string()
				.trim()
				.toLowerCase()
				.min(2, 'ingredient name should be longer than 2 characters')
				.max(100, 'ingredient name should not be longer than 100 characters'),
			{required_error: 'list of ingredients is required'}
		)
			.min(1, 'ingredients list should consist of at least 1 item')
			.max(25, 'ingredients list should not be over 25 elements long'),
		categories: z.array(
			z.string()
				.trim()
				.toLowerCase()
				.min(2, 'category name should be longer than 2 characters')
				.max(100, 'category name should not be longer than 100 characters'),
			{required_error: 'at least 1 category is required'}
		)
			.min(1, 'at least 1 category is required')
			.max(5, 'maximum 5 categories are allowed')
	});

	const validatedReqBody = validateObject(ValidationSchema, req.body);

	if (validatedReqBody.data == null) {
		return MISSING_BODY_FIELDS(res, validatedReqBody.errors);
	}

	const createdRecipe = await createRecipe({
		...validatedReqBody.data,
		userId: res.locals.user.id
	});

	if (createdRecipe == null) {
		return SERVER_ERROR(res, 'Something went wrong! Recipe has not been created');
	}

	return CREATED(res, 'Recipe created successfully', {recipe: createdRecipe});
};

export const GetRecipeByIdHandler = async (req: Request, res: Response) => {
	const {id} = req.params;

	if (id == null || !Number.isInteger(Number(id))) {
		return BAD_REQUEST(res, 'Invalid or missing \'id\' param');
	}

	const recipe = await getRecipeFullObjectById(+id);

	if (recipe == null) {
		return NOT_FOUND(res, `Recipe with ID of ${id} not found.`);
	}

	return SUCCESS(res, 'Recipe fetched successfully', {recipe});
};

export const GetRecipesHandler = async (req: Request, res: Response) => {
	const PAGE_MIN = 1;
	const LIMIT_MAX = 3;

	const ValidationSchema = z.object({
		page: z.string().regex(/^\d+$/).optional(),
		limit: z.string().regex(/^\d+$/).optional(),
		excludeMyRecipes: z.string().optional()
	});

	const validatedReqQuery = validateObject(ValidationSchema, req.query);

	if (validatedReqQuery.data?.page == null && validatedReqQuery.data?.limit == null) {
		return BAD_REQUEST(res, 'page number OR maximum of recipes for page param is required');
	}

	const {page = PAGE_MIN, limit = LIMIT_MAX} = {
		page: parseInt(validatedReqQuery.data.page ?? '' + PAGE_MIN),
		limit: parseInt(validatedReqQuery.data.limit ?? '' + LIMIT_MAX),
	};
	const startIndex = (page - 1) * limit;

	const recipes = await getRecipesAllWithAuthors({
		startIndex,
		limit,
		doNotIncludeRecipesOfUserId: validatedReqQuery.data?.excludeMyRecipes === 'true' ? res.locals.user.id : undefined
	});

	if (recipes == null) {
		return NOT_FOUND(res, 'no recipes found');
	}

	const recipesWithAuthors = recipes.map(recipe => {
		const {user, ...rest} = recipe;
		return {
			...rest,
			author: user
		}
	});

	const totalRecipes = await getRecipesCount({doNotIncludeRecipesOfUserId: validatedReqQuery.data?.excludeMyRecipes === 'true' ? res.locals.user.id : undefined}) ?? -1;
	const totalPages = Math.ceil(totalRecipes / limit);

	const responseData = {
		page,
		limit,
		totalRecipes,
		totalPages,
		recipes: recipesWithAuthors
	};

	if (page > totalPages) {
		return BAD_REQUEST(res, 'No more pages', responseData);
	}

	return SUCCESS(res, 'Paginated recipes fetched successfully', responseData);
};
