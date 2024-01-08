import {Category, Ingredient, PrismaClient, PrismaPromise, Recipe} from '@prisma/client';
import logger from '../../utils/logger';
import {SearchRecipeBy} from './recipe.controller';

const prisma = new PrismaClient();

type RecipeToAddOrUpdate =
	Omit<Recipe, 'id' | 'createdAt'>
	& {
	ingredients: Array<string>,
	categories: Array<string>
};

/**
 * Save recipe in the database.
 *
 * @returns Recipe object with arrays of Ingredient objects and Category objects from database or null if error.
 */
export const createRecipe = async (recipe: RecipeToAddOrUpdate) => {

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
					where: {name: ingredientName.toLowerCase()},
					update: {},
					create: {name: ingredientName.toLowerCase()}
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
					where: {name: categoryName.toLowerCase()},
					update: {},
					create: {name: categoryName.toLowerCase()}
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
 * Save updated recipe in the database.
 *
 * @returns Recipe object with arrays of Ingredient objects and Category objects from database or null if error.
 */
export const updateRecipe = async (recipeId: number, recipeToUpdate: RecipeToAddOrUpdate) => {
	let result = null;
	try {
		await prisma.$transaction(async (transactionalPrisma) => {
			const {ingredients, categories, ...recipeToUpdateObject} = recipeToUpdate;

			const existingRecipe = await transactionalPrisma.recipe.findUnique({
				where: {id: recipeId},
			});

			if (!existingRecipe) {
				throw new Error('Recipe not found');
			}

			const [updatedRecipeEntry, _, __] = await Promise.all([
				transactionalPrisma.recipe.update({where: {id: recipeId}, data: recipeToUpdateObject}),
				transactionalPrisma.recipeIngredient.deleteMany({where: {recipeId}}), // delete all recipe <-> category AND
				transactionalPrisma.recipeCategory.deleteMany({where: {recipeId}}) // recipe <-> ingredient associations
			]);

			// find or create ingredient
			const createIngredientsPromises = ingredients.map(ingredientName => {
				return transactionalPrisma.ingredient.upsert({
					where: {name: ingredientName.toLowerCase()},
					update: {},
					create: {name: ingredientName.toLowerCase()}
				});
			});
			const createIngredientsResults = await Promise.all(createIngredientsPromises);
			const createdIngredientsIds = createIngredientsResults.map(ingredient => ingredient.id);

			// associate ingredient with recipe
			const recipeIngredientPromises = createdIngredientsIds.map(ingredientId => {
				return transactionalPrisma.recipeIngredient.create({
					data: {recipeId, ingredientId}
				});
			});

			// find or create category
			const createCategoriesPromises = categories.map(categoryName => {
				return transactionalPrisma.category.upsert({
					where: {name: categoryName.toLowerCase()},
					update: {},
					create: {name: categoryName.toLowerCase()}
				});
			});
			const createCategoriesResults = await Promise.all(createCategoriesPromises);
			const createdCategoriesIds = createCategoriesResults.map(category => category.id);

			// associate category with recipe
			const recipeCategoriesPromises = createdCategoriesIds.map(categoryId => {
				return transactionalPrisma.recipeCategory.create({
					data: {recipeId, categoryId}
				});
			});

			await Promise.all([...recipeIngredientPromises, ...recipeCategoriesPromises]);

			result = {
				ingredients: createIngredientsResults,
				categories: createCategoriesResults,
				...updatedRecipeEntry
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
 * Removes recipe and its data from the database.
 *
 * @param recipeId Recipe's ID to be removed.
 */
export const deleteRecipe = (recipeId: number) => {
	try {
		return prisma.recipe.delete({where: {id: recipeId}});
	} catch (error) {
		logger.error(error);
		return null;
	}
};

/**
 * Returns Recipe object with given recipe's ID.
 *
 * @returns Recipe object with author or null if error.
 * @param recipeId {number} Recipe's ID.
 */
export const getRecipeById = (recipeId: number) => {
	try {
		return prisma.recipe.findFirst({
			where: {id: recipeId},
			select: {
				author: {
					select: {id: true, name: true, picture: true, admin: true, joinedAt: true}
				},
				id: true,
				title: true,
				cookingTimeMinutes: true,
				description: true,
				isPublic: true,
				createdAt: true,
				location: true,
				userId: true
			}
		});
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
 * @param currentLoggedUserId {number} User ID of currently logged user.
 * @param doNotIncludeOwnRecipes {boolean} Boolean indicating excluding recipes of current logged user from result.
 * @returns Array of RecipeWithoutCoords objects or null if error.
 */
export const getPublicRecipesWithAuthors = ({startIndex, limit, currentLoggedUserId, doNotIncludeOwnRecipes}: {
	startIndex?: number,
	limit?: number,
	currentLoggedUserId: number,
	doNotIncludeOwnRecipes?: boolean
}) => {
	try {
		return prisma.recipe.findMany({
			where: {
				AND: [
					{userId: {not: doNotIncludeOwnRecipes ? currentLoggedUserId : undefined}},
					{isPublic: true}
				]
			},
			orderBy: {createdAt: 'desc'},
			skip: startIndex,
			take: limit,
			select: {
				author: {
					select: {id: true, name: true, picture: true, admin: true, joinedAt: true}
				},
				id: true,
				title: true,
				cookingTimeMinutes: true,
				description: true,
				isPublic: true,
				createdAt: true,
				location: true,
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
 * @param currentLoggedUserId {number} User ID of currently logged user.
 * @param doNotIncludeOwnRecipes {boolean} Boolean indicating excluding recipes of current logged user from result.
 * @returns {Promise<number> | null} Number of recipes in the database.
 */
export const getPublicRecipesCount = ({currentLoggedUserId, doNotIncludeOwnRecipes}: {
	currentLoggedUserId: number,
	doNotIncludeOwnRecipes?: boolean
}): Promise<number> | null => {
	try {
		return prisma.recipe.count({
			where: {
				AND: [
					{userId: {not: doNotIncludeOwnRecipes ? currentLoggedUserId : undefined}},
					{isPublic: true}
				]
			},
		});
	} catch (error) {
		logger.error(error);
		return null;
	}
};

/**
 * Returns array of Recipe objects created by given user.
 *
 * @param startIndex {number} Pagination parameter.
 * @param limit {number} Pagination parameter.
 * @param includePublic {boolean} Indicating whether to include public recipes.
 * @param includePrivate {boolean} Indicating whether to include private recipes.
 * @param userId {number} User ID whose recipes you want.
 * @returns Array of RecipeWithoutCoords objects or null if error.
 */
export const getRecipesByUserIdWithAuthors = ({startIndex, limit, includePublic, includePrivate, userId}: {
	startIndex?: number,
	limit?: number,
	includePublic?: boolean,
	includePrivate?: boolean,
	userId: number,
}) => {
	try {
		return prisma.recipe.findMany({
			where: {
				AND: [
					{userId},
					{
						OR: [
							{isPublic: includePublic},
							{isPublic: !includePrivate},
						]
					}
				]
			},
			orderBy: {createdAt: 'desc'},
			skip: startIndex,
			take: limit,
			select: {
				author: {
					select: {id: true, name: true, picture: true, admin: true, joinedAt: true}
				},
				id: true,
				title: true,
				cookingTimeMinutes: true,
				description: true,
				isPublic: true,
				createdAt: true,
				location: true,
				userId: true
			}
		});
	} catch (error) {
		logger.error(error);
		return null;
	}
};

/**
 * Returns number of recipes created by given user in the database.
 *
 * @param includePublic {boolean} Indicating whether to include public recipes.
 * @param includePrivate {boolean} Indicating whether to include private recipes.
 * @param userId {number} User ID whose recipes count you want.
 * @returns {Promise<number> | null} Number of recipes created by given user in the database.
 */
export const getRecipesByUserIdCount = ({includePublic, includePrivate, userId}: {
	includePublic?: boolean,
	includePrivate?: boolean
	userId: number,
}): Promise<number> | null => {
	try {
		return prisma.recipe.count({
			where: {
				AND: [
					{userId},
					{
						OR: [
							{isPublic: includePublic},
							{isPublic: !includePrivate},
						]
					}
				]
			},
		});
	} catch (error) {
		logger.error(error);
		return null;
	}
};

/**
 * Returns Recipe object with arrays of Category objects and Ingredient objects.
 *
 * @returns {} Recipe object or null if error.
 * @param recipeId {number} Recipe's ID.
 */
export const getRecipeFullObjectById = async (recipeId: number) => {
	try {
		const recipe = await getRecipeById(recipeId);

		if (recipe == null) {
			return null;
		}

		const categoriesPromise = getRecipeCategoriesByRecipeId(recipeId);
		const ingredientsPromise = getRecipeIngredientsByRecipeId(recipeId);

		const [categories, ingredients] = await Promise.all([categoriesPromise, ingredientsPromise]);

		if (categories == null || ingredients == null) {
			return null;
		}

		return {
			...recipe,
			categories: _shapeCategoriesArray(categories),
			ingredients: _shapeIngredientsArray(ingredients)
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

export const _shapeIngredientsArray = (recipeIngredientsWithIngredient: Array<IngredientWithIngredientField>) => {
	return recipeIngredientsWithIngredient.map(recipeIngredient => recipeIngredient.ingredient);
};

type CategoryWithCategoryField = { category: Category };
/**
 * Returns list of {category: Category} objects or null if error.
 *
 * @returns {PrismaPromise<Array<CategoryWithCategoryField>> | null} List of {category: Category} objects or null if error.
 * @param recipeId {number} Recipe's ID.
 */
export const getRecipeCategoriesByRecipeId = (recipeId: number): PrismaPromise<Array<CategoryWithCategoryField>> | null => {
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

export const _shapeCategoriesArray = (recipeCategoriesWithCategory: Array<CategoryWithCategoryField>) => {
	return recipeCategoriesWithCategory.map(recipeCategory => recipeCategory.category);
};

/**
 * Returns array of Recipe objects with given ingredient.
 *
 * @param startIndex {number} Pagination parameter.
 * @param limit {number} Pagination parameter.
 * @param searchBy {SearchRecipeBy} Indicating searching type.
 * @param name {string} Name of ingredient/category.
 * @param currentLoggedUserId {number} User ID of currently logged user.
 * @param doNotIncludeOwnRecipes {boolean} Boolean indicating excluding recipes of current logged user from result.
 * @returns {} Array of Recipe objects with given ingredient/category or null if error.
 */
export const getPublicRecipesByIngredientOrCategoryName = async ({
	                                                                 startIndex,
	                                                                 limit,
	                                                                 searchBy,
	                                                                 name,
	                                                                 currentLoggedUserId,
	                                                                 doNotIncludeOwnRecipes
                                                                 }: {
	startIndex?: number,
	limit?: number,
	searchBy: SearchRecipeBy,
	name: string,
	currentLoggedUserId: number,
	doNotIncludeOwnRecipes?: boolean
}) => {
	try {
		// Find the ingredient or category by name
		const ingredientOrCategory = searchBy === 'ingredient' ?
			(await prisma.ingredient.findUnique({where: {name: name.toLowerCase()}, select: {id: true}})) :
			(await prisma.category.findUnique({where: {name: name.toLowerCase()}, select: {id: true}}));

		if (ingredientOrCategory == null) {
			// not found
			return null;
		}

		// Find recipes containing the given ingredient or category ID
		return prisma.recipe.findMany({
			where: {
				RecipeIngredient: searchBy === 'ingredient' ? {some: {ingredientId: ingredientOrCategory.id}} : undefined,
				RecipeCategory: searchBy === 'category' ? {some: {categoryId: ingredientOrCategory.id}} : undefined,
				isPublic: true,
				userId: {not: doNotIncludeOwnRecipes ? currentLoggedUserId : undefined}
			},
			orderBy: {createdAt: 'desc'},
			skip: startIndex,
			take: limit,
			select: {id: true},
		});
	} catch (error) {
		logger.error(error);
		return null;
	}
};

/**
 * Returns count of recipes with given ingredient/category.
 *
 * @param searchBy {SearchRecipeBy} Indicating searching type.
 * @param name {string} Name of ingredient/category.
 * @param currentLoggedUserId {number} User ID of currently logged user.
 * @param doNotIncludeOwnRecipes {boolean} Boolean indicating excluding recipes of current logged user from result.
 * @returns {Promise<number | null>} Returns count of recipes with given ingredient/category or null if error.
 */
export const getPublicRecipesByIngredientOrCategoryNameCount = async ({
	                                                                      searchBy,
	                                                                      name,
	                                                                      currentLoggedUserId,
	                                                                      doNotIncludeOwnRecipes
                                                                      }: {
	startIndex?: number,
	limit?: number,
	searchBy: SearchRecipeBy,
	name: string,
	currentLoggedUserId: number,
	doNotIncludeOwnRecipes?: boolean
}): Promise<number | null> => {
	try {
		// Find the ingredient or category by name
		const ingredientOrCategory = searchBy === 'ingredient' ?
			(await prisma.ingredient.findUnique({where: {name: name.toLowerCase()}, select: {id: true}})) :
			(await prisma.category.findUnique({where: {name: name.toLowerCase()}, select: {id: true}}));

		if (ingredientOrCategory == null) {
			// not found
			return null;
		}

		// Find recipes containing the given ingredient ID
		return prisma.recipe.count({
			where: {
				RecipeIngredient: searchBy === 'ingredient' ? {some: {ingredientId: ingredientOrCategory.id}} : undefined,
				RecipeCategory: searchBy === 'category' ? {some: {categoryId: ingredientOrCategory.id}} : undefined,
				isPublic: true,
				userId: {not: doNotIncludeOwnRecipes ? currentLoggedUserId : undefined}
			},
		});
	} catch (error) {
		logger.error(error);
		return null;
	}
};

/**
 * Returns array of Recipe objects with given ingredient names.
 *
 * @param startIndex {number} Pagination parameter.
 * @param limit {number} Pagination parameter.
 * @param searchBy {SearchRecipeBy} Indicating searching type.
 * @param names {Array<string>} List of names of ingredient/category.
 * @param currentLoggedUserId {number} User ID of currently logged user.
 * @param doNotIncludeOwnRecipes {boolean} Boolean indicating excluding recipes of current logged user from result.
 * @returns {} Array of Recipe objects with given ingredient/category or null if error.
 */
export const getPublicRecipesByIngredientOrCategoryNamesList = async ({
	                                                                      startIndex,
	                                                                      limit,
	                                                                      searchBy,
	                                                                      names,
	                                                                      currentLoggedUserId,
	                                                                      doNotIncludeOwnRecipes
                                                                      }: {
	startIndex?: number,
	limit?: number,
	searchBy: SearchRecipeBy,
	names: Array<string>,
	currentLoggedUserId: number,
	doNotIncludeOwnRecipes?: boolean
}) => {
	try {
		// Find the ingredients or categories by names
		const ingredientsOrCategoriesPromises = searchBy === 'ingredient' ?
			(names.map(name => prisma.ingredient.findUnique({where: {name: name.toLowerCase()}, select: {id: true}}))) :
			(names.map(name => prisma.category.findUnique({where: {name: name.toLowerCase()}, select: {id: true}})));

		const ingredientsOrCategories = await Promise.all(ingredientsOrCategoriesPromises);
		const foundIngredientsOrCategoriesIds = ingredientsOrCategories
			.filter(item => item != null)
			.map(item => item!.id);

		if (foundIngredientsOrCategoriesIds == null) {
			// not found
			return null;
		}

		// Find recipes containing the given ingredients or categories IDs
		return prisma.recipe.findMany({
			where: {
				RecipeIngredient: searchBy === 'ingredient' ? {every: {ingredientId: {in: foundIngredientsOrCategoriesIds}}} : undefined,
				RecipeCategory: searchBy === 'category' ? {every: {categoryId: {in: foundIngredientsOrCategoriesIds}}} : undefined,
				isPublic: true,
				userId: {not: doNotIncludeOwnRecipes ? currentLoggedUserId : undefined}
			},
			orderBy: {createdAt: 'desc'},
			skip: startIndex,
			take: limit,
			select: {id: true},
		});
	} catch (error) {
		logger.error(error);
		return null;
	}
};

/**
 * Returns count of recipes with given ingredient/category names.
 *
 * @param searchBy {SearchRecipeBy} Indicating searching type.
 * @param names {Array<string>} List of names of ingredient/category.
 * @param currentLoggedUserId {number} User ID of currently logged user.
 * @param doNotIncludeOwnRecipes {boolean} Boolean indicating excluding recipes of current logged user from result.
 * @returns {Promise<number | null>} Number of recipes with given ingredients/categories or null if error.
 */
export const getPublicRecipesByIngredientOrCategoryNamesListCount = async ({
	                                                                      searchBy,
	                                                                      names,
	                                                                      currentLoggedUserId,
	                                                                      doNotIncludeOwnRecipes
                                                                      }: {
	searchBy: SearchRecipeBy,
	names: Array<string>,
	currentLoggedUserId: number,
	doNotIncludeOwnRecipes?: boolean
}): Promise<number | null> => {
	try {
		// Find the ingredients or categories by names
		const ingredientsOrCategoriesPromises = searchBy === 'ingredient' ?
			(names.map(name => prisma.ingredient.findUnique({where: {name: name.toLowerCase()}, select: {id: true}}))) :
			(names.map(name => prisma.category.findUnique({where: {name: name.toLowerCase()}, select: {id: true}})));

		const ingredientsOrCategories = await Promise.all(ingredientsOrCategoriesPromises);
		const foundIngredientsOrCategoriesIds = ingredientsOrCategories
			.filter(item => item != null)
			.map(item => item!.id);

		if (foundIngredientsOrCategoriesIds == null) {
			// not found
			return null;
		}

		// Find recipes containing the given ingredients or categories IDs
		return prisma.recipe.count({
			where: {
				RecipeIngredient: searchBy === 'ingredient' ? {every: {ingredientId: {in: foundIngredientsOrCategoriesIds}}} : undefined,
				RecipeCategory: searchBy === 'category' ? {every: {categoryId: {in: foundIngredientsOrCategoriesIds}}} : undefined,
				isPublic: true,
				userId: {not: doNotIncludeOwnRecipes ? currentLoggedUserId : undefined}
			},
		});
	} catch (error) {
		logger.error(error);
		return null;
	}
};
