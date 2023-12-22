import api from '@/api/index.ts';
import Recipe from '@/types/Recipe.ts';

type RecipeToAdd = Pick<Recipe, 'title' | 'cookingTimeMinutes' | 'description'> & {
	isPublic?: boolean;
	location?: string;
	latitude?: number;
	longitude?: number;
};
export const createRecipe = (recipe: RecipeToAdd) => api.post('/recipe', {...recipe});
export const getRecipeById = (id: number) => api.get(`/recipe/${id}`);

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
