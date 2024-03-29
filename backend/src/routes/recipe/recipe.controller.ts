import {Request, Response} from 'express';
import {
	BAD_REQUEST,
	CREATED,
	MISSING_BODY_FIELDS, MISSING_QUERY_PARAMS,
	NOT_FOUND,
	SERVER_ERROR,
	SUCCESS
} from '../../utils/httpCodeResponses/messages';
import {z} from 'zod';
import validateObject from '../../utils/validateObject';
import {
	createRecipe,
	getPublicRecipesCount,
	getRecipeFullObjectById,
	getPublicRecipesWithAuthors,
	getRecipesByUserIdWithAuthors,
	getRecipesByUserIdCount,
	getRecipeCategoriesByRecipeId,
	getRecipeIngredientsByRecipeId,
	_shapeCategoriesArray,
	_shapeIngredientsArray,
	getRecipeById,
	getPublicRecipesByIngredientOrCategoryNameCount,
	getPublicRecipesByIngredientOrCategoryName,
	updateRecipe,
	deleteRecipe, getPublicRecipesByIngredientOrCategoryNamesList, getPublicRecipesByIngredientOrCategoryNamesListCount
} from './recipe.service';
import config from '../../../config';
import {getAverageStars} from './review/review.service';
import paginationParams from '../../utils/pagination/paginationParams';

const recipeValidationSchemaObject = {
	title: z
		.string({required_error: 'title is required'})
		.trim()
		.min(config.APP.RECIPE.TITLE.LENGTH.MIN, `title must be longer than ${config.APP.RECIPE.TITLE.LENGTH.MIN} characters`)
		.max(config.APP.RECIPE.TITLE.LENGTH.MAX, `title must be shorter than ${config.APP.RECIPE.TITLE.LENGTH.MAX} characters`),
	cookingTimeMinutes: z
		.number({required_error: 'cooking time is required'})
		.min(config.APP.RECIPE.COOKING_TIME_MINUTES.MIN, 'cooking time must be positive')
		.max(config.APP.RECIPE.COOKING_TIME_MINUTES.MAX, `cooking time must be less than ${config.APP.RECIPE.COOKING_TIME_MINUTES.MAX}`),
	description: z
		.string({required_error: 'description is required'})
		.trim()
		.min(config.APP.RECIPE.DESCRIPTION.LENGTH.MIN, `description should be longer than ${config.APP.RECIPE.DESCRIPTION.LENGTH.MIN} characters`),
	isPublic: z.boolean().default(false),
	location: z
		.string()
		.trim()
		.max(config.APP.RECIPE.LOCATION.LENGTH.MAX, `location must be shorter than ${config.APP.RECIPE.LOCATION.LENGTH.MAX} characters`)
		.or(z.null()).default(null), // could be null
	ingredients: z.array(
		z.string()
			.trim()
			.toLowerCase()
			.min(config.APP.RECIPE.INGREDIENT.LENGTH.MIN, `ingredient name should be longer than ${config.APP.RECIPE.INGREDIENT.LENGTH.MIN} characters`)
			.max(config.APP.RECIPE.INGREDIENT.LENGTH.MAX, `ingredient name should not be longer than ${config.APP.RECIPE.INGREDIENT.LENGTH.MAX} characters`)
			.refine(ingredient => !ingredient.includes(','), 'Ingredient name should not contain commas'),
		{required_error: 'list of ingredients is required'}
	)
		.min(config.APP.RECIPE.INGREDIENT.QUANTITY.MIN, `ingredients list should consist of at least ${config.APP.RECIPE.CATEGORY.QUANTITY.MIN} item`)
		.max(config.APP.RECIPE.INGREDIENT.QUANTITY.MAX, `ingredients list should not be over ${config.APP.RECIPE.CATEGORY.QUANTITY.MAX} elements long`),
	categories: z.array(
		z.string()
			.trim()
			.toLowerCase()
			.min(config.APP.RECIPE.CATEGORY.LENGTH.MIN, `category name should be longer than ${config.APP.RECIPE.CATEGORY.LENGTH.MIN} characters`)
			.max(config.APP.RECIPE.CATEGORY.LENGTH.MAX, `category name should not be longer than ${config.APP.RECIPE.CATEGORY.LENGTH.MAX} characters`)
			.refine(category => !category.includes(','), 'Category name should not contain commas'),
		{required_error: `at least ${config.APP.RECIPE.CATEGORY.QUANTITY.MIN} categor${config.APP.RECIPE.CATEGORY.QUANTITY.MIN === 1 ? 'y is' : 'ies are'} required`}
	)
		.min(config.APP.RECIPE.CATEGORY.QUANTITY.MIN, `at least ${config.APP.RECIPE.CATEGORY.QUANTITY.MIN} categor${config.APP.RECIPE.CATEGORY.QUANTITY.MIN === 1 ? 'y is' : 'ies are'} required`)
		.max(config.APP.RECIPE.CATEGORY.QUANTITY.MAX, `maximum ${config.APP.RECIPE.CATEGORY.QUANTITY.MAX} categories are allowed`)
};

export const CreateRecipeHandler = async (req: Request, res: Response) => {
	const ValidationSchema = z.object(recipeValidationSchemaObject);

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

	const [recipe, stars] = await Promise.all([getRecipeFullObjectById(+id), getAverageStars(+id)]);

	if (recipe == null) {
		return NOT_FOUND(res, `Recipe with ID of ${id} not found.`);
	}

	if (recipe.userId !== res.locals.user.id && !recipe.isPublic) {
		return NOT_FOUND(res, `Recipe with ID of ${id} not found.`);
	}

	return SUCCESS(res, 'Recipe fetched successfully', {
		recipe: {
			...recipe,
			stars
		}
	});
};

export const UpdateRecipeHandler = async (req: Request, res: Response) => {
	const {id} = req.params;

	if (id == null || !Number.isInteger(Number(id))) {
		return BAD_REQUEST(res, 'Invalid or missing \'id\' param');
	}

	const recipe = await getRecipeById(+id);

	// check if recipe exists and current user is its author
	if (recipe == null || recipe.userId !== res.locals.user.id) {
		return BAD_REQUEST(res, `Recipe with ID = '${id}' does not exist`);
	}

	const ValidationSchema = z.object(recipeValidationSchemaObject);

	const validatedReqBody = validateObject(ValidationSchema, req.body);

	if (validatedReqBody.data == null) {
		return MISSING_BODY_FIELDS(res, validatedReqBody.errors);
	}

	const updatedRecipe = await updateRecipe(+id, {
		...validatedReqBody.data,
		userId: res.locals.user.id
	});

	if (updatedRecipe == null) {
		return SERVER_ERROR(res, 'Something went wrong! Recipe has not been updated');
	}

	return SUCCESS(res, 'Recipe updated successfully', {recipe: updatedRecipe});
};

export const DeleteRecipeHandler = async (req: Request, res: Response) => {
	const {id} = req.params;

	if (id == null || !Number.isInteger(Number(id))) {
		return BAD_REQUEST(res, 'Invalid or missing \'id\' param');
	}

	const recipe = await getRecipeById(+id);

	// check if recipe exists and current user is its author
	if (recipe == null || recipe.userId !== res.locals.user.id) {
		return BAD_REQUEST(res, `Recipe with ID = '${id}' does not exist`);
	}

	const deletedRecipe = await deleteRecipe(+id);
	if (deletedRecipe == null) {
		return SERVER_ERROR(res, 'Something went wrong! Recipe has not been deleted');
	}

	return SUCCESS(res, 'Recipe deleted successfully');
};

export const GetRecipesHandler = async (req: Request, res: Response) => {
	const ValidationSchema = z.object({
		page: z.string().regex(/^\d+$/).optional(),
		limit: z.string().regex(/^\d+$/).optional(),
		excludeMyRecipes: z.string().optional(),
		userId: z.string().regex(/^\d+$/).optional(),
		includePublic: z.string().optional(),
		includePrivate: z.string().optional(),
	});

	const validatedReqQuery = validateObject(ValidationSchema, req.query);

	if (validatedReqQuery.data == null) {
		return MISSING_QUERY_PARAMS(res, validatedReqQuery.errors);
	}

	if (validatedReqQuery.data?.page == null && validatedReqQuery.data?.limit == null) {
		return BAD_REQUEST(res, 'page OR page param is required');
	}

	const userId = validatedReqQuery.data?.userId ?? null;

	if (userId != null && !Number.isInteger(Number(userId))) {
		return BAD_REQUEST(res, 'Invalid \'userId\' param');
	}

	const {startIndex, page, limit} = paginationParams({
		page: validatedReqQuery.data.page,
		limit: validatedReqQuery.data.limit
	});

	// check if userId is defined => fetch recipes for given userId otherwise fetch all public recipes
	const [
		recipes,
		totalRecipes
	] = await Promise.all([
		userId != null ? getRecipesByUserIdWithAuthors({
			startIndex,
			limit,
			userId: +userId,
			includePublic: validatedReqQuery.data?.includePublic === 'true',
			includePrivate: validatedReqQuery.data?.includePrivate === 'true' && res.locals.user.id === +userId // currently logged user can only get public recipes of other user
		}) : getPublicRecipesWithAuthors({
			startIndex,
			limit,
			currentLoggedUserId: res.locals.user.id,
			doNotIncludeOwnRecipes: validatedReqQuery.data?.excludeMyRecipes === 'true'
		}),
		userId != null ? getRecipesByUserIdCount({
			userId: +userId,
			includePublic: validatedReqQuery.data?.includePublic === 'true',
			includePrivate: validatedReqQuery.data?.includePrivate === 'true' && res.locals.user.id === +userId // currently logged user can only get public recipes of other user
		}) : getPublicRecipesCount({
			currentLoggedUserId: res.locals.user.id,
			doNotIncludeOwnRecipes: validatedReqQuery.data?.excludeMyRecipes === 'true'
		})
	]);

	if (recipes == null) {
		return NOT_FOUND(res, 'no recipes found');
	}

	const starsPromises = Promise.all(recipes.map(recipe => getAverageStars(recipe.id)));
	const categoriesPromises = Promise.all(recipes.map(recipe => getRecipeCategoriesByRecipeId(recipe.id)));
	const ingredientsPromises = Promise.all(recipes.map(recipe => getRecipeIngredientsByRecipeId(recipe.id)));

	const [stars, categories, ingredients] = await Promise.all([starsPromises, categoriesPromises, ingredientsPromises]);

	const recipesWithAuthorsCategoriesIngredientsAndStars = recipes
		.map((recipe, idx) => {
			const categoriesToShape = categories[idx];
			const ingredientsToShape = ingredients[idx];

			return {
				...recipe,
				stars: stars[idx],
				categories: categoriesToShape == null ? null : _shapeCategoriesArray(categoriesToShape),
				ingredients: ingredientsToShape == null ? null : _shapeIngredientsArray(ingredientsToShape)
			};
		});

	const totalPages = Math.ceil((totalRecipes ?? 0) / limit);

	const responseData = {
		page,
		limit,
		totalRecipes,
		totalPages,
		recipes: recipesWithAuthorsCategoriesIngredientsAndStars
	};

	if (page > totalPages) {
		return BAD_REQUEST(res, 'No more pages', responseData);
	}

	return SUCCESS(res, 'Paginated recipes fetched successfully', responseData);
};

export type SearchRecipeBy = 'ingredient' | 'category';
export const GetRecipesByIngredientOrCategoryNameHandler = (searchBy: SearchRecipeBy) => {
	return async (req: Request, res: Response) => {
		const {name} = req.params;

		const ValidationSchema = z.object({
			page: z.string().regex(/^\d+$/).optional(),
			limit: z.string().regex(/^\d+$/).optional(),
			excludeMyRecipes: z.string().optional()
		});

		const validatedReqQuery = validateObject(ValidationSchema, req.query);

		if (validatedReqQuery.data == null) {
			return MISSING_QUERY_PARAMS(res, validatedReqQuery.errors);
		}

		if (validatedReqQuery.data?.page == null && validatedReqQuery.data?.limit == null) {
			return BAD_REQUEST(res, 'page OR page param is required');
		}

		if (name == null) {
			return BAD_REQUEST(res, 'Invalid or missing \'name\' param');
		}

		const {startIndex, page, limit} = paginationParams({
			page: validatedReqQuery.data.page,
			limit: validatedReqQuery.data.limit
		});

		// fetch recipes with given ingredient/category
		const [
			recipesWithIdFieldOnly,
			totalRecipes
		] = await Promise.all([
			getPublicRecipesByIngredientOrCategoryName({
				startIndex,
				limit,
				name,
				searchBy,
				doNotIncludeOwnRecipes: validatedReqQuery.data?.excludeMyRecipes === 'true',
				currentLoggedUserId: res.locals.user.id
			}),
			getPublicRecipesByIngredientOrCategoryNameCount({
				startIndex,
				limit,
				name,
				searchBy,
				doNotIncludeOwnRecipes: validatedReqQuery.data?.excludeMyRecipes === 'true',
				currentLoggedUserId: res.locals.user.id
			})
		]);

		if (recipesWithIdFieldOnly == null) {
			return NOT_FOUND(res, 'No recipes found');
		}

		const recipesPromises = Promise.all(recipesWithIdFieldOnly.map(recipe => getRecipeById(recipe.id)));
		const starsPromises = Promise.all(recipesWithIdFieldOnly.map(recipe => getAverageStars(recipe.id)));
		const categoriesPromises = Promise.all(recipesWithIdFieldOnly.map(recipe => getRecipeCategoriesByRecipeId(recipe.id)));
		const ingredientsPromises = Promise.all(recipesWithIdFieldOnly.map(recipe => getRecipeIngredientsByRecipeId(recipe.id)));

		const [
			recipes,
			stars,
			categories,
			ingredients,
		] = await Promise.all([
			recipesPromises,
			starsPromises,
			categoriesPromises,
			ingredientsPromises
		]);

		const recipesWithAuthorsCategoriesIngredientsAndStars = recipes
			.map((recipe, idx) => {
				const categoriesToShape = categories[idx];
				const ingredientsToShape = ingredients[idx];

				return {
					...recipe,
					stars: stars[idx],
					categories: categoriesToShape == null ? null : _shapeCategoriesArray(categoriesToShape),
					ingredients: ingredientsToShape == null ? null : _shapeIngredientsArray(ingredientsToShape)
				};
			});

		const totalPages = Math.ceil((totalRecipes ?? 0) / limit);

		const responseData = {
			page,
			limit,
			totalRecipes,
			totalPages,
			recipes: recipesWithAuthorsCategoriesIngredientsAndStars
		};

		if (page > totalPages) {
			return BAD_REQUEST(res, 'No more pages', responseData);
		}

		return SUCCESS(res, 'Paginated recipes fetched successfully', responseData);
	};
};

export const GetRecipesByIngredientOrCategoryNamesListHandler = (searchBy: SearchRecipeBy) => {
	return async (req: Request, res: Response) => {
		const {commaSeparatedNames} = req.params;

		if (commaSeparatedNames == null) {
			return BAD_REQUEST(res, 'Missing \'commaSeparatedNames\' param');
		}

		const names = commaSeparatedNames
			.split(',')
			.map(name => name.trim())
			.filter(name => name !== '');

		const minimumListLength = 2;
		if (names.length < minimumListLength) {
			return BAD_REQUEST(res, `Invalid 'commaSeparatedNames' param. Minimum amount of names is ${minimumListLength}.`);
		}

		const ValidationSchema = z.object({
			page: z.string().regex(/^\d+$/).optional(),
			limit: z.string().regex(/^\d+$/).optional(),
			excludeMyRecipes: z.string().optional()
		});

		const validatedReqQuery = validateObject(ValidationSchema, req.query);

		if (validatedReqQuery.data == null) {
			return MISSING_QUERY_PARAMS(res, validatedReqQuery.errors);
		}

		if (validatedReqQuery.data?.page == null && validatedReqQuery.data?.limit == null) {
			return BAD_REQUEST(res, 'page OR page param is required');
		}

		const {startIndex, page, limit} = paginationParams({
			page: validatedReqQuery.data.page,
			limit: validatedReqQuery.data.limit
		});

		// fetch recipes with given ingredient/category names
		const [
			recipesWithIdFieldOnly,
			totalRecipes
		] = await Promise.all([
			getPublicRecipesByIngredientOrCategoryNamesList({
				startIndex,
				limit,
				names,
				searchBy,
				doNotIncludeOwnRecipes: validatedReqQuery.data?.excludeMyRecipes === 'true',
				currentLoggedUserId: res.locals.user.id
			}),
			getPublicRecipesByIngredientOrCategoryNamesListCount({
				names,
				searchBy,
				doNotIncludeOwnRecipes: validatedReqQuery.data?.excludeMyRecipes === 'true',
				currentLoggedUserId: res.locals.user.id
			})
		]);

		if (recipesWithIdFieldOnly == null || recipesWithIdFieldOnly.length === 0) {
			return NOT_FOUND(res, 'No recipes found');
		}

		const recipesPromises = Promise.all(recipesWithIdFieldOnly.map(recipe => getRecipeById(recipe.id)));
		const starsPromises = Promise.all(recipesWithIdFieldOnly.map(recipe => getAverageStars(recipe.id)));
		const categoriesPromises = Promise.all(recipesWithIdFieldOnly.map(recipe => getRecipeCategoriesByRecipeId(recipe.id)));
		const ingredientsPromises = Promise.all(recipesWithIdFieldOnly.map(recipe => getRecipeIngredientsByRecipeId(recipe.id)));

		const [
			recipes,
			stars,
			categories,
			ingredients,
		] = await Promise.all([
			recipesPromises,
			starsPromises,
			categoriesPromises,
			ingredientsPromises
		]);

		const recipesWithAuthorsCategoriesIngredientsAndStars = recipes
			.map((recipe, idx) => {
				const categoriesToShape = categories[idx];
				const ingredientsToShape = ingredients[idx];

				return {
					...recipe,
					stars: stars[idx],
					categories: categoriesToShape == null ? null : _shapeCategoriesArray(categoriesToShape),
					ingredients: ingredientsToShape == null ? null : _shapeIngredientsArray(ingredientsToShape)
				};
			});

		const totalPages = Math.ceil((totalRecipes ?? 0) / limit);

		const responseData = {
			page,
			limit,
			totalRecipes,
			totalPages,
			recipes: recipesWithAuthorsCategoriesIngredientsAndStars
		};

		if (page > totalPages) {
			return BAD_REQUEST(res, 'No more pages', responseData);
		}

		return SUCCESS(res, 'Paginated recipes fetched successfully', responseData);
	};
};
