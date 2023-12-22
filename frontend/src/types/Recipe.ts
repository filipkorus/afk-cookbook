type Recipe = {
	id: number;
	title: string;
	cookingTimeMinutes: number;
	description: string;
	isPublic: boolean;
	createdAt: Date;
	location: string;
	userId: number;
};

export default Recipe;
