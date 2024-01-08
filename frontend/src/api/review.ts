import api from '@/api/index';
import ReviewToAdd from '@/types/ReviewToAdd';

export const createReview = async ({review, recipeId}: {
	review: ReviewToAdd,
	recipeId: number
}) => {
	const {data} = await api.post(`/recipe/review/${recipeId}`, {
		stars: review.stars,
		comment: review.comment
	});
	return data;
}

export const editReview = async ({review, reviewId}: {
	review: ReviewToAdd,
	reviewId: number
}) => {
	const {data} = await api.put(`/recipe/review/${reviewId}`, {
		stars: review.stars,
		comment: review.comment
	});
	return data;
}

export const deleteReview = async (reviewId: number) => {
	const {data} = await api.delete(`/recipe/review/${reviewId}`);
	return data;
}

export const getReviews = async ({recipeId, page, limit}: {
	recipeId: number,
	page?: number,
	limit?: number
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

	const {data} = await api.get(`/recipe/review/${recipeId}?${params}`);

	return data;
};

export const getStars = async (recipeId: number) => {
	const {data} = await api.get(`/recipe/review/stars/${recipeId}`);

	return data;
};
