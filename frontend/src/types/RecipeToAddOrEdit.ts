type RecipeToAddOrEdit = {
	title: string;
	cookingTimeMinutes: number;
	description: string;
	isPublic?: boolean;
	location?: string;
	categories: Array<string>,
	ingredients: Array<string>
};

export default RecipeToAddOrEdit;
