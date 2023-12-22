import Category from '@/types/Category';
import Ingredient from '@/types/Ingredient';

type RecipeToAdd = {
	title: string;
	cookingTimeMinutes: number;
	description: string;
	isPublic?: boolean;
	location?: string;
	// categories: Array<Pick<Category, 'name'>>,
	// ingredients: Array<Pick<Ingredient, 'name'>>
};

export default RecipeToAdd;
