import Review from '@/types/Review';

type ReviewToAdd = Pick<Review, 'stars' | 'comment'>;

export default ReviewToAdd;
