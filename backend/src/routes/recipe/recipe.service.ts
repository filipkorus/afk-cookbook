import {
	PrismaClient,
	Recipe,
	Ingredient,
	Category,
	RecipeIngredient,
	RecipeCategory,
	PrismaPromise, User
} from '@prisma/client';
import logger from '../../utils/logger';
import {getUserById} from '../user/user.service';

const prisma = new PrismaClient();

type RecipeToAdd =
	Omit<Recipe, 'id' | 'createdAt'>
	& {
	ingredients: Array<string>,
	categories: Array<string>
};

type FullRecipeObject = Recipe & {
	ingredients: Array<Ingredient>,
	categories: Array<Category>,
	author?: Omit<User, 'email' | 'banned'>
};

/**
 * Save recipe in the database.
 *
 * @returns Recipe object with arrays of Ingredient objects and Category objects from database or null if error.
 */
export const createRecipe = async (recipe: RecipeToAdd): Promise<FullRecipeObject | null> => {

	let result = null;
	try {
		await prisma.$transaction(async (transactionalPrisma) => {

			const {ingredients, categories, ...recipeObjectToCreate} = recipe;
			const createdRecipe = await transactionalPrisma.recipe.create({
				data: recipeObjectToCreate
			});

			if (createdRecipe == null) {
				throw new Error('Adding recipe to the database failed');
			}

			// find or create ingredient
			const createIngredientsPromises = ingredients.map(ingredientName => {
				return transactionalPrisma.ingredient.upsert({
					where: {name: ingredientName},
					update: {},
					create: {name: ingredientName}
				});
			});
			const createIngredientsResults = await Promise.all(createIngredientsPromises);
			const createdIngredientsIds = createIngredientsResults.map(ingredient => ingredient.id);

			// associate ingredient with recipe
			const recipeIngredientPromises = createdIngredientsIds.map(ingredientId => {
				return transactionalPrisma.recipeIngredient.create({
					data: {recipeId: createdRecipe.id, ingredientId}
				});
			});

			// find or create category
			const createCategoriesPromises = categories.map(categoryName => {
				return transactionalPrisma.category.upsert({
					where: {name: categoryName},
					update: {},
					create: {name: categoryName}
				});
			});
			const createCategoriesResults = await Promise.all(createCategoriesPromises);
			const createdCategoriesIds = createCategoriesResults.map(category => category.id);

			// associate category with recipe
			const recipeCategoriesPromises = createdCategoriesIds.map(categoryId => {
				return transactionalPrisma.recipeCategory.create({
					data: {recipeId: createdRecipe.id, categoryId}
				});
			});

			await Promise.all([...recipeIngredientPromises, ...recipeCategoriesPromises]);

			result = {
				ingredients: createIngredientsResults,
				categories: createCategoriesResults,
				...createdRecipe
			};
		});
	} catch (error) {
		logger.error(error);
		result = null;
	} finally {
		await prisma.$disconnect();
	}

	return result;
};

/**
 * Returns Recipe object with given recipe's ID.
 *
 * @returns {Promise<Recipe|null>|null} Recipe object or null if error.
 * @param recipeId {number} Recipe's ID.
 */
export const getRecipeById = (recipeId: number): Promise<Recipe | null> | null => {
	try {
		return prisma.recipe.findFirst({where: {id: recipeId}});
	} catch (error) {
		logger.error(error);
		return null;
	}
};

/**
 * Returns array of Recipe objects.
 *
 * @param startIndex {number} Pagination parameter.
 * @param limit {number} Pagination parameter.
 * @param doNotIncludeRecipesOfUserId {number} User ID of author whose recipes you want to exclude from result.
 * @returns  Array of Recipe objects or null if error.
 */
export const getRecipesAllWithAuthors = ({startIndex, limit, doNotIncludeRecipesOfUserId}: {
	startIndex?: number,
	limit?: number,
	doNotIncludeRecipesOfUserId?: number
} = {}) => {
	try {
		return prisma.recipe.findMany({
			where: {userId: {not: doNotIncludeRecipesOfUserId}},
			orderBy: {createdAt: 'desc'},
			skip: startIndex,
			take: limit,
			select: {
				user: {
					select: {id: true, name: true, picture: true, admin: true, joinedAt: true}
				},
				id: true,
				title: true,
				cookingTimeMinutes: true,
				description: true,
				isPublic: true,
				createdAt: true,
				location: true,
				latitude: true,
				userId: true
			}
		});
	} catch (error) {
		logger.error(error);
		return null;
	}
};

/**
 * Returns number of recipes in the database.
 *
 * @param doNotIncludeRecipesOfUserId {number} User ID of author whose recipes you want to exclude from result.
 * @returns {Promise<number> | null} Number of recipes in the database.
 */
export const getRecipesCount = ({doNotIncludeRecipesOfUserId}: {
	doNotIncludeRecipesOfUserId?: number
} = {}): Promise<number> | null => {
	try {
		return prisma.recipe.count({
			where: {userId: {not: doNotIncludeRecipesOfUserId ?? undefined}}
		});
	} catch (error) {
		logger.error(error);
		return null;
	}
};

/**
 * Returns Recipe object with arrays of Category objects and Ingredient objects.
 *
 * @returns {Promise<Recipe|null>} Recipe object or null if error.
 * @param recipeId {number} Recipe's ID.
 */
export const getRecipeFullObjectById = async (recipeId: number): Promise<FullRecipeObject | null> => {
	try {
		const recipe = await getRecipeById(recipeId);

		if (recipe == null) {
			return null;
		}

		const authorPromise = getUserById(recipe.userId);
		const categoriesPromise = getRecipeCategoriesByRecipeId(recipeId);
		const ingredientsPromise = getRecipeIngredientsByRecipeId(recipeId);

		const [author, categories, ingredients] = await Promise.all([authorPromise, categoriesPromise, ingredientsPromise]);

		if (author == null || categories == null || ingredients == null) {
			return null;
		}

		const {email, banned, ...authorWithOutUselessInfo} = author;

		return {
			...recipe,
			author: authorWithOutUselessInfo,
			categories: shapeCategoriesArray(categories),
			ingredients: shapeIngredientsArray(ingredients)
		};
	} catch (error) {
		logger.error(error);
		return null;
	}
};

type IngredientWithIngredientField = { ingredient: Ingredient };
/**
 * Returns list of {ingredient: Ingredient} objects or null if error.
 *
 * @returns {PrismaPromise<Array<IngredientWithIngredientField>> | null} List of {ingredient: Ingredient} objects or null if error.
 * @param recipeId {number} Recipe's ID.
 */
export const getRecipeIngredientsByRecipeId = (recipeId: number): PrismaPromise<Array<IngredientWithIngredientField>> | null => {
	try {
		return prisma.recipeIngredient.findMany({
			where: {recipeId},
			select: {ingredient: true, ingredientId: false, recipeId: false}
		});
	} catch (error) {
		logger.error(error);
		return null;
	}
};

const shapeIngredientsArray = (recipeIngredientsWithIngredient: Array<IngredientWithIngredientField>) => {
	return recipeIngredientsWithIngredient.map(recipeIngredient => recipeIngredient.ingredient);
};

type CategoryWithCategoryField = { category: Category };
/**
 * Returns list of {category: Category} objects or null if error.
 *
 * @returns {PrismaPromise<Array<CategoryWithCategoryField>> | null} List of {category: Category} objects or null if error.
 * @param recipeId {number} Recipe's ID.
 */
export const getRecipeCategoriesByRecipeId = (recipeId: number): PrismaPromise<Array<CategoryWithCategoryField>> | null | any => {
	try {
		return prisma.recipeCategory.findMany({
			where: {recipeId},
			select: {category: true, categoryId: false, recipeId: false}
		});
	} catch (error) {
		logger.error(error);
		return null;
	}
};

const shapeCategoriesArray = (recipeCategoriesWithCategory: Array<CategoryWithCategoryField>) => {
	return recipeCategoriesWithCategory.map(recipeCategory => recipeCategory.category);
};
