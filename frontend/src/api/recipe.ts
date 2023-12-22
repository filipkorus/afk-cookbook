import api from '@/api/index.ts';
import Recipe from '@/types/Recipe.ts';

type RecipeToAdd = Pick<Recipe, 'title' | 'cookingTimeMinutes' | 'description'> & {
	isPublic?: boolean;
	location?: string;
	latitude?: number;
	longitude?: number;
	categories: Array<string>,
	ingredients: Array<string>
};
export const createRecipe = async (recipe: RecipeToAdd) => {
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
