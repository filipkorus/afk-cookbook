import User from '@/types/User.ts';

type Review = {
	id: number;
	stars: number;
	comment: string;
	recipeId: number;
	userId: number;
	createdAt: Date;
	author: Omit<User, 'email' | 'banned'>;
};

export default Review;
