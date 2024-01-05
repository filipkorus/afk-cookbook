import {Router} from 'express';
import {CreateReviewHandler, GetReviewsByRecipeIdHandler, GetStarsByRecipeIdHandler} from './review.controller';

const router = Router();

router.post('/:recipeId', CreateReviewHandler);
router.get('/:recipeId', GetReviewsByRecipeIdHandler);
router.get('/stars/:recipeId', GetStarsByRecipeIdHandler);

export default router;
