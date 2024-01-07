import api from '@/api';
import Recipe from '@/types/Recipe';

type RecipeToAddWithCategoriesAndIngredients = Pick<Recipe, 'title' | 'cookingTimeMinutes' | 'description'> & {
	isPublic?: boolean;
	location?: string;
	latitude?: number;
	longitude?: number;
	categories: Array<string>,
	ingredients: Array<string>
};

const getPaginationUrlParams = ({page, limit}: {
	page: number,
	limit: number
}) => {
	let params = '';
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

	return params;
};

export const createRecipe = async (recipe: RecipeToAddWithCategoriesAndIngredients) => {
	const {data} = await api.post('/recipe', {...recipe});
	return data;
}
export const getRecipeById = async (id: number) => {
	const {data} = await api.get(`/recipe/${id}`);
	return data;
}

export const getRecipes = async ({page, limit, excludeMyRecipes, categoryName, ingredientName}: {
	page: number,
	limit: number,
	excludeMyRecipes?: boolean,
	categoryName?: string,
	ingredientName?: string,
}) => {
	if (categoryName != null && ingredientName != null) {
		throw new Error('categoryName and ingredientName cannot be defined at once');
	}

	const params = `excludeMyRecipes=${excludeMyRecipes ?? false}` + getPaginationUrlParams({page, limit});

	const getURL = () => {
		if (categoryName == null && ingredientName == null) {
			return `/recipe?${params}`;
		}

		if (categoryName != null) {
			return `/recipe/category/${categoryName}?${params}`;
		}

		if (ingredientName != null) {
			return `/recipe/ingredient/${ingredientName}?${params}`;
		}

		return `/recipe?${params}`;
	};

	const {data} = await api.get(getURL());

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
