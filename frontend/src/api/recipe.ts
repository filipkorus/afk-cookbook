import api from '@/api/index.ts';
import Recipe from '@/types/Recipe.ts';
import RecipeToAdd from '@/types/RecipeToAdd.ts';

type RecipeToAddWithCategoriesAndIngredients = Pick<Recipe, 'title' | 'cookingTimeMinutes' | 'description'> & {
	isPublic?: boolean;
	location?: string;
	latitude?: number;
	longitude?: number;
	categories: Array<string>,
	ingredients: Array<string>
};

export const createRecipe = async (recipe: RecipeToAddWithCategoriesAndIngredients) => {
	const {data} = await api.post('/recipe', {...recipe});
	return data;
}
export const getRecipeById = async (id: number) => {
	const {data} = await api.get(`/recipe/${id}`);
	return data;
}

export const getRecipes = async ({page, limit, excludeMyRecipes}: {
	page?: number,
	limit?: number,
	excludeMyRecipes?: boolean
} = {}) => {
	let params = `excludeMyRecipes=${excludeMyRecipes ?? false}`;
	if (page == null) {
		if (limit != null) {
			params += `&limit=${limit}`;
		}
	} else {
		if (limit != null) {
			params += `&page=${page}&limit=${limit}`;
		} else {
			params += `&page=${page}`;
		}
	}

	const {data} = await api.get(`/recipe?${params}`);

	return data;
};

/**
 * Returns fetched array of Recipe objects created by given user.
 *
 * @param page {number} Page number.
 * @param limit {number} Entries per page.
 * @param includePublic {boolean} Indicating whether to include public recipes.
 * @param includePrivate {boolean} Indicating whether to include private recipes.
 * @param userId {number} User ID whose recipes you want.
 */
export const getRecipesByUserId = async ({page, limit, includePublic, includePrivate, userId}: {
	page?: number,
	limit?: number,
	includePublic?: boolean,
	includePrivate?: boolean,
	userId: number
}) => {
	let params = `includePublic=${includePublic ?? false}&includePrivate=${includePrivate ?? false}`;
	if (page == null) {
		if (limit != null) {
			params += `&limit=${limit}`;
		}
	} else {
		if (limit != null) {
			params += `&page=${page}&limit=${limit}`;
		} else {
			params += `&page=${page}`;
		}
	}

	const {data} = await api.get(`/recipe/?userId=${userId}&${params}`);

	return data;
};
