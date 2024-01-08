import {Router} from 'express';
import {
	CreateReviewHandler, DeleteReviewHandler,
	GetReviewsByRecipeIdHandler,
	GetStarsByRecipeIdHandler,
	UpdateReviewHandler
} from './review.controller';

const router = Router();

router.post('/:recipeId', CreateReviewHandler);
router.get('/:recipeId', GetReviewsByRecipeIdHandler);

router.put('/:reviewId', UpdateReviewHandler);
router.delete('/:reviewId', DeleteReviewHandler);

router.get('/stars/:recipeId', GetStarsByRecipeIdHandler);

export default router;
