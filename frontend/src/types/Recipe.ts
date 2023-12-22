type Recipe = {
	id: number;
	title: string;
	cookingTimeMinutes: number;
	description: string;
	isPublic: boolean;
	createdAt: Date;
	location: string;
	latitude: number;
	longitude: number;
	userId: number;
};

export default Recipe;
